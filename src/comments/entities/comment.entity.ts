import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { User } from "src/auth/entities/user.entity";
import { Media } from "src/media/entities/media.entity";


@Schema()
export class Comment {

    @Prop({ type: 'ObjectId', ref: 'users' })
    idUsuario: User;

    @Prop({ type: 'ObjectId', ref: 'media' })
    idPelicula: Media;

    _id?: string;

    @Prop({ type: String })
    contenido: string;

    @Prop({ type: Date, default: Date.now })
    fecha: Date;

}

export const CommentSchema = SchemaFactory.createForClass(Comment)
