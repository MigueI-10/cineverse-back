import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Media } from './entities/media.entity';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Comment } from 'src/comments/entities/comment.entity';
import { Favorite } from 'src/favorite/entities/favorite.entity';
import { FavoriteService } from 'src/favorite/favorite.service';
import { User } from 'src/auth/entities/user.entity';
import { SearchMediaDto } from './dto/search-media.dto';
import { FilterMediaDto } from './dto/filter-media.dto';

@Injectable()
export class MediaService {

  constructor(
    @InjectModel(Media.name) private mediaModel: Model<Media>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Favorite.name) private favoriteModel: Model<Favorite>,
    @InjectModel(User.name) private userModel: Model<User>,
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

  async findAllGenres() {
    return await this.mediaModel.distinct("genero");
  }


  async filterByYear(year: number) {
    return await this.mediaModel.find({ anyo: year })
  }

  async filterByPoints(points: number, filter?: string) {

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

  async getCommentsFromFilms(id: string) {
    return await this.commentModel.find({ idPelicula: id })
                                  .populate('idUsuario', 'name _id');
  
  }

  async searchMedia(searchMediaDto: SearchMediaDto): Promise<Media[]> {
    const { search = '', limit = 15, skip = 0 } = searchMediaDto;

    if (search == '') return

    const results = await this.mediaModel
      .find({ titulo: { $regex: search, $options: 'i' } }) 
      .select('_id imagen titulo')
      .limit(+limit)
      .skip(+skip);

    return results;
  }

  async filterMedia(filterMediaDto: FilterMediaDto): Promise<Media[]> {

    const { nota, anyo, duracion, episodios, tipo, generos, limit = 10, skip = 0 } = filterMediaDto;

    const filter = {}

    if(tipo !== undefined){
      filter['tipo'] = { $in: [].concat(tipo) }
    }

    if(generos !== undefined){
      filter['genero'] = { $in: [].concat(generos) }
    }
    
    if(nota !== '' && nota !== '0'){
      filter['puntuacion'] = { $gt: Number(nota) }
    }

    if(anyo !== undefined){
      let arrAnyo = anyo.map((a) => Number(a));

      const anyoMax = Math.max(...arrAnyo) + 10;
      filter['anyo'] = { $gte: Math.min(...arrAnyo), $lte: anyoMax };
    }

    if(episodios !== undefined){
      if(episodios.includes('+100')){
        filter['episodios'] = { $gte: 100 }
      }else if(episodios.includes('+50')){
        filter['episodios'] = { $gte: 50, $lt: 100 }
      }else if(episodios.includes('-50')){
        filter['episodios'] = { $lt: 50 }
      }
    }

    if(duracion !== '' && duracion !== '0'){
      if(duracion === '3'){
        filter['duracion'] = { $gte: 180 }
      }else if(duracion === '2'){
        filter['duracion'] = { $gte: 120, $lt: 180 }
      }else if(duracion === '1'){
        filter['duracion'] = { $gte: 60 }
      }
    }

    const results = await this.mediaModel
          .find(filter)
          .limit(+limit)
          .skip(+skip);

     return results;
  }


  async updateMoviePoints(movieId: string) {

    if (!Types.ObjectId.isValid(movieId)) {
      return { error: 'El object id no es valido' }
    }

    const movieObjectId = new Types.ObjectId(movieId);

    const existingResult = await this.favoriteModel.findOne({
      idPelicula: movieObjectId,
    });

    // Si ya existe un favorito, retorna un error
    if (!existingResult) {
      return { error: 'Esta pelicula no existe' }
    }

    const averagePoints = await this.favoriteService.calculateAverageRatingForMovie(movieId);

    if (averagePoints !== null) {
      // Actualizar la película con la media de las notas
      console.log(averagePoints);
      console.log(typeof (averagePoints));
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
      throw new NotFoundException('Esta película/serie no existe');
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

      if (!result) {
        return { message: "No se encontró ningún documento con este id" };
      }

      return { message: "Pelicula actualizada correctamente" };

    } catch (error) {
      return { error: error.message }
    }

  }

  async remove(id: string) {
    try {
      const result = await this.mediaModel.findByIdAndDelete(id);
      if (!result) {
        throw new Error(`No se encontró ningún documento con el ID ${id}`);
      }
      return { message: "Pelicula eliminada correctamente" };
    } catch (error) {
      return { error: error.message }
    }
  }
}
