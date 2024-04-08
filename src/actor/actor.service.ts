import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateActorDto } from './dto/create-actor.dto';
import { UpdateActorDto } from './dto/update-actor.dto';
import { Actor } from './entities/actor.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class ActorService { 
  
  constructor(
    @InjectModel(Actor.name) private actorModel: Model<Actor>,
  ){

  }

  async create(createActorDto: CreateActorDto) {
    try {

      const existingActor = await this.actorModel.findOne({ nombre: createActorDto.nombre });
      if (existingActor) {
        throw new Error('Ya existe un actor con ese nombre');
      }

      const actorCreated = new this.actorModel(createActorDto);
      await actorCreated.save();

      return { message: `Actor añadido correctamente` };

    } catch (error) {
      return {message: error.message}
    }
  }

  async findAll() {
    return await this.actorModel.find({})
  }

  findOne(id: string) {

    if (!Types.ObjectId.isValid(id)) {
      return {message: 'El ID de actor proporcionado no es válido.'}
    }

    return this.actorModel.findById(id);
  }

  async update(id: string, updateActorDto: UpdateActorDto) {
    try {

      if (!Types.ObjectId.isValid(id)) {
        return {message: 'El ID de actor proporcionado no es válido.'}
      }
      
      const result = await this.actorModel.findByIdAndUpdate(id, updateActorDto, { new: true });

      if(!result){
        return {message: "No se encontró ningún documento con este id"};
      }

      if (!updateActorDto.actuaciones || updateActorDto.actuaciones.length === 0) {
        return { message: "Las apariciones del actor no puede quedar vacío" };
      }

      return {message: "Actor actualizado correctamente"};

    } catch (error) {
      return {error: error.message } 
    }
  }

  async remove(id: string) {

    try {

      if (!Types.ObjectId.isValid(id)) {
        return {message: 'El ID de actor proporcionado no es válido.'}
      }

      const result = await this.actorModel.findByIdAndDelete(id);
      if (!result) {
        throw new Error(`No se encontró ningún documento con el ID ${id}`);
      }
      return {message: "Actor eliminado correctamente"};
    } catch (error) {
      return {error: error.message }      
    }

    
  }
}
