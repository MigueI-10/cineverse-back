import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';

import * as bcryptjs from 'bcryptjs';

import { RegisterUserDto, CreateUserDto, UpdateAuthDto, LoginDto } from './dto';

import { User } from './entities/user.entity';

import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel( User.name ) 
    private userModel: Model<User>,

    private jwtService: JwtService,
   ) {}

  
  async create(createUserDto: CreateUserDto): Promise<User> {
    
    try {
      
      const { password, ...userData } = createUserDto;
           
      const newUser = new this.userModel({
        password: bcryptjs.hashSync( password, 10 ),
        ...userData
      });

       await newUser.save();
       const { password:_, ...user } = newUser.toJSON();
       
       return user;
      
    } catch (error) {
      if( error.code === 11000 ) {
        throw new BadRequestException(`${ createUserDto.email } already exists!`)
      }
      throw new InternalServerErrorException('Something terribe happen!!!');
    }

  }

  async register( registerDto: RegisterUserDto ): Promise<LoginResponse> {

    const user = await this.create( registerDto );

    return {
      user: user,
      token: this.getJwtToken({ id: user._id })
    }
  }


  async login( loginDto: LoginDto ):Promise<LoginResponse> {

    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if ( !user ) {
      throw new UnauthorizedException('Not valid credentials - email');
    }
    
    if ( !bcryptjs.compareSync( password, user.password ) ) {
      throw new UnauthorizedException('Not valid credentials - password');
    }

    const { password:_, ...rest  } = user.toJSON();

    return {
      user: rest,
      token: this.getJwtToken({ id: user.id }),
    }
  
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findUserById( id: string ) {
    const user = await this.userModel.findById( id );
    const { password, ...rest } = user.toJSON();
    return rest;
  }


  async findOne(id: string) {
    return await this.findUserById(id)
  }

  async update(id: string, updateAuthDto: UpdateAuthDto) {
    
    if (updateAuthDto.password) {
      // Encriptar la nueva contraseña
      const hashedPassword = bcryptjs.hashSync(updateAuthDto.password, 10);
      // Actualizar el usuario con la contraseña encriptada
      return this.userModel.findByIdAndUpdate(id, { ...updateAuthDto, password: hashedPassword }, { new: true });
    }

    //return this.userModel.findByIdAndUpdate(id, updateAuthDto, { new: true });
  }

  async remove(id: string) {
    try {

      const user = await this.userModel.findById(id);
      if (!user) {
        return {message: 'El usuario no existe.'};
      }

      await this.userModel.findByIdAndDelete(id);
      return {message: 'El usuario ha sido eliminado exitosamente.'}; 
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      return null;
    }
  }

  getJwtToken( payload: JwtPayload ) {
    const token = this.jwtService.sign(payload);
    return token;
  }

}