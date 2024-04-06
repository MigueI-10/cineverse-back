import { IsBoolean, IsInt, IsMongoId, IsNotEmpty, IsNumber, IsOptional, Max, Min, ValidateIf } from "class-validator";

export class CreateFavoriteDto {

    @IsNotEmpty()
    @IsMongoId()
    idUsuario: string;

    @IsNotEmpty()
    @IsMongoId()
    idPelicula: string;

    @IsOptional()
    @IsBoolean()
    esFavorito: boolean;

    @ValidateIf(o => o.notaUsuario !== undefined) 
    @IsInt()
    @Min(0)
    @Max(10)
    @IsOptional()
    notaUsuario?: number;

}
