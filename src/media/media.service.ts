import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Media } from './entities/media.entity';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class MediaService {

  constructor(@InjectModel(Media.name) private mediaModel: Model<Media>, private jwtService: JwtService) { }


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


  async findAllSeriesList() {
    return await this.mediaModel.find({ tipo: 'serie' })
  }

  findAll() {
    return `This action returns all media`;
  }

  async findOne(id: string) {
    return this.mediaModel.findById(id);
  }

  async update(id: string, updateMediaDto: UpdateMediaDto) {

    try {
      
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
