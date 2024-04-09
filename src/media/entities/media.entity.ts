import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema()
export class Media {

    _id ?:string;

    @Prop({required: true})
    tipo:        'serie' | 'pelicula';

    @Prop({required: true})
    imagen:        string;

    @Prop({unique: true, required: true})
    titulo:      string;

    @Prop({required: true, type: [{ type: 'ObjectId', ref: 'Actor' }]})
    actores: Types.ObjectId[];

    @Prop({required: true})
    director:   string;

    @Prop({required: true, type: Number, min: 1920, max: 2028})
    anyo:        number;

    @Prop({required: true})
    genero:      string;

    @Prop({required: true})
    descripcion: string;

    @Prop({type: Number})
    episodios?: number; 

    @Prop({type: Number})
    duracion?: number;

    @Prop({required: true , type: Number, min: 0, max: 10})
    puntuacion: number;

}

export const MediaSchema = SchemaFactory.createForClass(Media)
