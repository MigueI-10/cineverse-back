import { Injectable } from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Favorite } from './entities/favorite.entity';
import { Model, Types } from 'mongoose';
import { createWriteStream } from 'fs';
import { SearchFavoriteDto } from './dto/search-favorite.dto';

@Injectable()
export class FavoriteService {

  constructor(
    @InjectModel(Favorite.name) private favoriteModel: Model<Favorite>,
    private jwtService: JwtService,
  ) {

  }

  async create(createFavoriteDto: CreateFavoriteDto) {

    try {

      if (!Types.ObjectId.isValid(createFavoriteDto.idPelicula) || !Types.ObjectId.isValid(createFavoriteDto.idUsuario)) {
        return {message: 'El ID de película o usuario proporcionado no es válido.'}
      }

      // Comprobamos si hay ya un registro en la bd para ese usuario y pelicula
      const existingResult = await this.favoriteModel.findOne({
        idUsuario: createFavoriteDto.idUsuario,
        idPelicula: createFavoriteDto.idPelicula,
      });

      // Si ya existe un favorito, retorna un error
      if (existingResult) {
        return { error:  'Ya existe un favorito para esta película y usuario'}
      }

      //si el usuario solo marca nota meter un false en favorito
      if (createFavoriteDto.notaUsuario !== undefined) {
        createFavoriteDto.esFavorito = false;
      }

      const createdFavorite = new this.favoriteModel(createFavoriteDto);
      console.log(createdFavorite);
      return await createdFavorite.save();
      // return { message: `Favorito creado correctamente` };
    } catch (error) {
      return { error: error.message }
    }

  }

  async searchFavorite(searchFavoriteDto: SearchFavoriteDto): Promise<Favorite[]> {
    const { search = [], limit = 15, skip = 0 } = searchFavoriteDto;


    const results = await this.favoriteModel
      .find({ titulo: { $regex: search, $options: 'i' } }) 
      .select('_id imagen titulo')
      .limit(+limit)
      .skip(+skip);

    return results;
  }

  async findFavoritesOfAnUser(usuarioId: string){

    if (!Types.ObjectId.isValid(usuarioId)) {
      return { error:  'El object id no es valido'} 
    }

    const usuarioObjectId = new Types.ObjectId(usuarioId);

    const existingResult = await this.favoriteModel.findOne({
      idUsuario: usuarioObjectId,
    });

    // Si no existe el usuario, retorna un error
    if (!existingResult) {
      return { error:  'Este usuario no tiene registros de favoritos'} 
    }

    // Aplicar la agregación
    return this.favoriteModel.aggregate([
      { 
        $match: { 
          "idUsuario": usuarioObjectId, 
          "esFavorito": true 
        } 
      },
      {
        $lookup: {
          from: "media", // Nombre de la colección de media
          localField: "idPelicula",
          foreignField: "_id",
          as: "pelicula"
        }
      },
      { 
        $unwind: "$pelicula" 
      },
      {
        $project: {
          "idPelicula": "$pelicula._id",
          "titulo": "$pelicula.titulo",
          "imagen": "$pelicula.imagen",
          "notaUsuario": "$notaUsuario" // Corregido para reflejar el nombre del campo en la colección de favoritos
        }
      }
    ]).exec();
  }

  async findRatingsOfAnUser(usuarioId: string){

    if (!Types.ObjectId.isValid(usuarioId)) {
      return { error:  'El object id no es valido'} 
    }

    const usuarioObjectId = new Types.ObjectId(usuarioId);

    const existingResult = await this.favoriteModel.findOne({
      idUsuario: usuarioObjectId,
      notaUsuario: { $exists: true }
    });

    // Si no existe el usuario, retorna un error
    if (!existingResult) {
      return { error:  'Este usuario no tiene registros de favoritos'} 
    }

    // Aplicar la agregación
    return this.favoriteModel.aggregate([
      { 
        $match: { 
          "idUsuario": usuarioObjectId, 
          "notaUsuario": { $exists: true } 
        } 
      },
      {
        $lookup: {
          from: "media", // Nombre de la colección de media
          localField: "idPelicula",
          foreignField: "_id",
          as: "pelicula"
        }
      },
      { 
        $unwind: "$pelicula" 
      },
      {
        $project: {
          "idPelicula": "$pelicula._id",
          "titulo": "$pelicula.titulo",
          "imagen": "$pelicula.imagen",
          "notaUsuario": "$notaUsuario" // Corregido para reflejar el nombre del campo en la colección de favoritos
        }
      }
    ]).exec();
  }

  async findFavoriteUserFilm(idUser: string, idMedia: string){

    if (!Types.ObjectId.isValid(idUser)) {
      return { error:  'El object id no es valido'} 
    }

    if (!Types.ObjectId.isValid(idMedia)) {
      return { error:  'El object id no es valido'} 
    }

    const existingResult = await this.favoriteModel.findOne({
      idUsuario: idUser,
      idPelicula: idMedia
    });

    // Si no existe el usuario, retorna un error
    if (!existingResult) {
      // return { error:  'Este usuario no tiene registros de favoritos'} 
      throw new Error(`Este usuario no tiene registros de favoritos`);
    }
    
    return existingResult
  }

  async calculateAverageRatingForMovie(movieId: string) {

    if (!Types.ObjectId.isValid(movieId)) {
      return { error:  'El object id no es valido'} 
    }

    const movieObjectId = new Types.ObjectId(movieId);
  
    const existingResult = await this.favoriteModel.findOne({
      idPelicula: movieObjectId,
    });

    // Si ya existe un favorito, retorna un error
    if (!existingResult) {
      return { error:  'Esta pelicula  no existe'} 
    }
    
    const result = await this.favoriteModel.aggregate([
      {
        $match: {
          "idPelicula": movieObjectId,
          "notaUsuario": { $exists: true } // Filtrar solo los registros que tienen una nota definida
        }
      },
      {
        $group: {
          _id: "$idPelicula", // Agrupar por id de película
          averageRating: { $avg: "$notaUsuario" } // Calcular la media de las notas
        }
      }
    ]).exec();
  
    // Si no se encontraron registros, retornar null
    if (result.length === 0) {
      return {message: 'No hay registros'};
    }
  
    // Retornar la media de las notas
    return  result[0].averageRating
  }
  

  findAll() {
    return `This action returns all favorite`;
  }

  findOne(id: number) {
    return `This action returns a #${id} favorite`;
  }

  async update(id: string, updateFavoriteDto: UpdateFavoriteDto) {
    try {
      console.log(updateFavoriteDto);
      const result = await this.favoriteModel.findByIdAndUpdate(id, updateFavoriteDto, { new: true });

      if (!result) {
        return { message: "No se encontró ningún documento con este id" };
      }
      console.log(result)
      return { message: "Favoritos actualizados correctamente" };

    } catch (error) {
      return { error: error.message }
    }
  }

  async remove(id: string) {
    try {
      const result = await this.favoriteModel.findByIdAndDelete(id);
      if (!result) {
        throw new Error(`No se encontró ningún documento con el ID ${id}`);
      }
      return { message: "Favorito eliminado correctamente" };
    } catch (error) {
      return { error: error.message }
    }
  }
}
