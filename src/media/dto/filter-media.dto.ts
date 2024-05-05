import { Transform, TransformFnParams } from "class-transformer";
import { IsOptional, IsNumberString, IsArray, IsNumber, IsString } from "class-validator";

export class FilterMediaDto {

    @IsOptional()
    @IsNumberString()
    limit?: number;

    @IsOptional()
    @IsNumberString()
    skip?: number;

    @IsOptional()
    @Transform(({ value }: TransformFnParams) => typeof value === 'string' ? value.split(',') : value, { toClassOnly: true })
    @IsArray()
    @IsString({ each: true })
    tipo?: string[];

    @IsOptional()
    @IsNumberString()
    nota?: number;

    @IsOptional()
    @Transform(({ value }: TransformFnParams) => typeof value === 'string' ? value.split(',') : value, { toClassOnly: true })
    @IsArray()
    @IsString({ each: true })
    generos?: string[];

    @IsOptional()
    @Transform(({ value }: TransformFnParams) => typeof value === 'string' ? value.split(',') : value, { toClassOnly: true })
    @IsArray()
    @IsString({ each: true })
    anyo?: string[];

    @IsOptional()
    @Transform(({ value }: TransformFnParams) => typeof value === 'string' ? value.split(',') : value, { toClassOnly: true })
    @IsArray()
    @IsString({ each: true })
    episodios?: string[];

    @IsOptional()
    @IsNumberString()
    duracion?: number;
}