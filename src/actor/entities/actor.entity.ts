import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Actor {

    _id ?:string;

    @Prop({unique: true, required: true})
    nombre:        string;

    @Prop({required: true})
    biografia:        string;

    @Prop({required: true})
    imagen:        string;

    @Prop({required: true})
    nacionalidad:        string;

    @Prop({ required: true, type: Date, default: Date.now })
    fechaNacimiento: Date;

    @Prop({required: true, type: [String]})
    actuaciones:     string[];
}

export const ActorSchema = SchemaFactory.createForClass(Actor)
