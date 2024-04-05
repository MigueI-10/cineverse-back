import { IsDate, IsDateString, IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class CreateCommentDto {

    @IsNotEmpty()
    @IsString()
    contenido: string;

    @IsNotEmpty()
    @IsDateString()
    fecha: string;

    @IsNotEmpty()
    @IsMongoId()
    idUsuario: string;

    @IsNotEmpty()
    @IsMongoId()
    idPelicula: string;
}
