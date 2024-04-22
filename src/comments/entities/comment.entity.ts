import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { User } from "src/auth/entities/user.entity";
import { Media } from "src/media/entities/media.entity";


@Schema()
export class Comment {

    @Prop({ required: true, type: 'ObjectId', ref: 'User' })
    idUsuario: User;

    @Prop({ required: true, type: 'ObjectId', ref: 'media' })
    idPelicula: Media;

    _id?: string;

    @Prop({ required: true, type: String })
    contenido: string;

    @Prop({ required: true, type: Date, default: Date.now })
    fecha: Date;

}

export const CommentSchema = SchemaFactory.createForClass(Comment)
