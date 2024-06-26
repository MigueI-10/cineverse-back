import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class User {

    _id?:string

    @Prop({unique: true, required: true})
    email:string;

    @Prop({required: true})
    name:string;

    @Prop({minlength: 8, required: true})
    password?:string;
    /**
     * Cambio a false para el email
     */
    @Prop({default: false})
    isActive:boolean;

    @Prop({type: [String], default: ['user']})
    roles: string[];


}

export const UserSchema = SchemaFactory.createForClass(User)

