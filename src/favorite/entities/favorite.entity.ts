import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { User } from "src/auth/entities/user.entity";
import { Media } from "src/media/entities/media.entity";


@Schema()
export class Favorite {

    @Prop({ required: true, type: 'ObjectId', ref: 'users' }, )
    idUsuario: User;

    @Prop({ required: true, type: 'ObjectId', ref: 'media' })
    idPelicula: Media;

    @Prop({ required: true, default: false })
    esFavorito: boolean;

    @Prop({type: Number,  min: 0, max: 10})
    notaUsuario?: number;

}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite)
