import { ArrayMinSize, IsArray, IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterUserDto {

    @IsEmail()
    email: string;
    
    @IsString()
    name: string;
    
    @MinLength(6)
    password: string;

    @IsArray()
    @IsOptional()
    @ArrayMinSize(1)
    roles?: string[];
}
