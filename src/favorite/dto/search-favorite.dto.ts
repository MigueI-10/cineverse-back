import { IsOptional, IsNumberString, IsArray, IsString } from "class-validator";

export class SearchFavoriteDto {
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    search?: string;

    @IsOptional()
    @IsNumberString()
    limit?: number;

    @IsOptional()
    @IsNumberString()
    skip?: number;
}