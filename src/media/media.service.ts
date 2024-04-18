import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Media } from './entities/media.entity';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Comment } from 'src/comments/entities/comment.entity';
import { Favorite } from 'src/favorite/entities/favorite.entity';
import { FavoriteService } from 'src/favorite/favorite.service';

@Injectable()
export class MediaService {

  constructor(
    @InjectModel(Media.name) private mediaModel: Model<Media>, 
    @InjectModel(Comment.name) private commentModel: Model<Comment>, 
    @InjectModel(Favorite.name) private favoriteModel: Model<Favorite>, 
    private favoriteService: FavoriteService,
    private jwtService: JwtService,
  ) { }


  async create(createMediaDto: CreateMediaDto) {
    try {
      const mediaCreated = new this.mediaModel(createMediaDto);
      await mediaCreated.save();

      return { message: `${mediaCreated.tipo} añadida correctamente` };

    } catch (error) {
      if (error.code == 11000) {
        throw new BadRequestException(`${createMediaDto.titulo} ya existe`)
      } else {
        throw new BadRequestException(`Ha ocurrido un error en la operacion`)
      }
    }
  }


  async findAllFilmList() {
    return await this.mediaModel.find({ tipo: 'pelicula' })
  }

  async filterByYear(year: number){
    return await this.mediaModel.find({ anyo: year })
  }

  async filterByPoints(points: number, filter?: string){

    let query: any = { puntuacion: points }; 

    if (filter === 'more') {
      query.puntuacion = { $gt: points }; 
    } else if (filter === 'less') {
      query.puntuacion = { $lt: points }; 
    }
  
    return await this.mediaModel.find(query);
  }

  async findAllSeriesList() {
    return await this.mediaModel.find({ tipo: 'serie' })
  }

  async getCommentsFromFilms(id:string){
    return await this.commentModel.find({idPelicula: id})
  }

  async updateMoviePoints(movieId: string){

    if (!Types.ObjectId.isValid(movieId)) {
      return { error:  'El object id no es valido'} 
    }

    const movieObjectId = new Types.ObjectId(movieId);
  
    const existingResult = await this.favoriteModel.findOne({
      idPelicula: movieObjectId,
    });

    // Si ya existe un favorito, retorna un error
    if (!existingResult) {
      return { error:  'Esta pelicula no existe'} 
    }

    const averagePoints = await this.favoriteService.calculateAverageRatingForMovie(movieId);

    if (averagePoints !== null) {
      // Actualizar la película con la media de las notas
      console.log(averagePoints);
      console.log(typeof(averagePoints));
      await this.mediaModel.updateOne({ _id: movieId }, { puntuacion: averagePoints });
      return { message: 'Media de notas actualizada correctamente.' };
    } else {
      return { message: 'No se encontraron notas para esta película.' };
    }
  }

  async findAll() {
    return await this.mediaModel.find({})
  }

  async findOne(id: string) {
    
    const pelicula = (await this.mediaModel.findById(id).populate('actores', 'nombre imagen _id'));
    if (!pelicula) {
        return {message: "Esta pelicula/serie no existe"}
    }

    console.log(pelicula);

    return pelicula;
  }

  async update(id: string, updateMediaDto: UpdateMediaDto) {

    try {

      if (!updateMediaDto.actores || updateMediaDto.actores.length === 0) {
        return { message: "Los actores de una pelicula no puede quedar vacíos" };
      }


      const result = await this.mediaModel.findByIdAndUpdate(id, updateMediaDto, { new: true });

      if(!result){
        return {message: "No se encontró ningún documento con este id"};
      }

      return {message: "Pelicula actualizada correctamente"};

    } catch (error) {
      return {error: error.message } 
    }

  }

  async remove(id: string) {
    try {
      const result = await this.mediaModel.findByIdAndDelete(id);
      if (!result) {
        throw new Error(`No se encontró ningún documento con el ID ${id}`);
      }
      return {message: "Pelicula eliminada correctamente"};
    } catch (error) {
      return {error: error.message }      
    }
  }
}
