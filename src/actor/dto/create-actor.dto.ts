import { IsArray, IsDateString, IsNotEmpty, IsString } from "class-validator";

export class CreateActorDto {

    @IsNotEmpty()
    @IsString()
    nombre:        string;

    @IsNotEmpty()
    @IsString()
    biografia:     string;

    @IsNotEmpty()
    @IsString()
    nacionalidad:  string;

    @IsNotEmpty()
    @IsString()
    imagen:  string;

    @IsNotEmpty()
    @IsDateString()
    fechaNacimiento: Date;

    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    actuaciones:     string[];

    



}
