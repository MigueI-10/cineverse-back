import { IsOptional, IsNumberString } from "class-validator";

export class SearchMediaDto {
    @IsOptional()
    search?: string;

    @IsOptional()
    @IsNumberString()
    limit?: number;

    @IsOptional()
    @IsNumberString()
    skip?: number;
}