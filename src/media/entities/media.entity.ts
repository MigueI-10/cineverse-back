import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Media {

    _id ?:string;

    @Prop({required: true})
    tipo:        'serie' | 'pelicula';

    @Prop({required: true})
    imagen:        string;

    @Prop({unique: true, required: true})
    titulo:      string;

    @Prop({required: true, type: [String]})
    actores:     string[];

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

    @Prop({type: Number, min: 0, max: 10})
    puntuacion: number;

}

export const MediaSchema = SchemaFactory.createForClass(Media)
