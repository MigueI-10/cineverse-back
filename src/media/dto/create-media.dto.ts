import { IsArray, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";


export class CreateMediaDto {

    @IsString()
    @IsIn(['serie', 'pelicula'])
    tipo:        'serie' | 'pelicula';

    @IsString()
    imagen:     string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    titulo:      string;

    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    actores:     string[];

    @IsString()
    @IsNotEmpty()
    director:   string;

    @IsInt()
    @Min(1920)
    @Max(2028)
    anyo:        number;

    @IsString()
    @IsNotEmpty()
    genero:      string;

    @IsString()
    @IsNotEmpty()
    descripcion: string;

    @IsOptional() 
    @IsInt()
    episodios?: number

    @IsOptional() 
    @IsInt()
    duracion?: number

    @IsOptional() 
    @IsInt()
    @Min(0)
    @Max(10)
    puntuacion?: number

}

