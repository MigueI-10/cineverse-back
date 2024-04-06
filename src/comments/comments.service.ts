import {  Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {

  constructor( @InjectModel( Comment.name) 
  private commentModel: Model<Comment>,){}


  async create(createCommentDto: CreateCommentDto) {
    try {


      
      const commentCreated = new this.commentModel(createCommentDto);
      console.log(commentCreated);
      await commentCreated.save();

      return { message: `Comentario creado correctamente` };
    } catch (error) {
      throw new Error('Error al crear el comentario');
    }
  }

  findAll() {
    return `This action returns all comments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  update(id: number, updateCommentDto: UpdateCommentDto) {
    return `This action updates a #${id} comment`;
  }

  async remove(id: string) {
    try {
      const result = await this.commentModel.findByIdAndDelete(id);
      if (!result) {
        throw new Error(`No se encontró ningún comentario con el ID ${id}`);
      }
      return {message: "Comentario eliminado correctamente"};
    } catch (error) {
      return {error: error.message }      
    }
  }
}
