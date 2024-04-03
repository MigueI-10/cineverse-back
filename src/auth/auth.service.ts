import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';

import * as bcryptjs from 'bcryptjs';

import { RegisterUserDto, CreateUserDto, UpdateAuthDto, LoginDto } from './dto';

import { User } from './entities/user.entity';

import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';

import * as nodeMailer from 'nodemailer';


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
    console.log(user);
    console.log("-----------");
     /**
      * Generacion del token específico para eso
      */
    
    const tokenEmail = this.getJwtToken({ id: user._id});
    const verificationLink = `http://localhost:4200/verify-token/${tokenEmail}`;

    this.sendEmail(user.email, verificationLink);

    return {
      user: user,
      token: this.getJwtToken({ id: user._id })
    }
  }


  async login( loginDto: LoginDto ):Promise<LoginResponse> {

    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    console.log(user);
    if ( !user ) {
      throw new UnauthorizedException('Not valid credentials - email');
    }
    
    if ( !bcryptjs.compareSync( password, user.password ) ) {
      throw new UnauthorizedException('Not valid credentials - password');
    }
    /**
     * para el control del email
     */
    if(!user.isActive){
      throw new UnauthorizedException('The account is not verified. Please check the mail');
    }

    const { password:_, ...rest  } = user.toJSON();

    return {
      user: rest,
      token: this.getJwtToken({ id: user.id }),
    }
  
  }

/**
 * Verificacion del token del usuario de registro y activar su cuenta
 */
async verifyTokenAndActivateUser(token: string): Promise<void> {
  try {
    // Verifica el token JWT
    const decoded = this.jwtService.verify(token);
    console.log(decoded);

    // Extrae el ID de usuario del token decodificado
    const userId = decoded.id;
    console.log("La id extraida del token es " + userId);

    // Busca el usuario en la base de datos
    const user = await this.userModel.findById(userId);
    console.log(user);

    // Si el usuario existe, actualiza su propiedad isActive a true
    if (user) {
      
      await this.userModel.updateOne({ _id: userId }, { $set: { isActive: true } }); // Método para actualizar el usuario en la base de datos
    }
  } catch (error) {
    // Si hay un error al verificar el token (p. ej., token inválido o expirado), maneja el error aquí
    throw new Error('Token inválido');
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

  async sendEmail(emailTo:string, verificationLink:string) {
    try {

      if (!emailTo) {
        return {message: 'El correo no ha sido proporcionado.'};
      }

      const transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: `${process.env.NODEMAILER_EMAIL}`,
          pass: `${process.env.NODEMAILER_PASS}`,
        },
        tls: {
          rejectUnauthorized: false // Permite certificados autofirmados
        }
      });

      const mailOptions = {
        from: `${process.env.NODEMAILER_EMAIL}`,
        to: emailTo,
        subject: 'Registro de cineverse',
        text: 'Text',
        html: `<!DOCTYPE html>
        <html lang="en">
        
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Template</title>
            <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
            <style>
            .btn {
              background: #3498db;
              background-image: -webkit-linear-gradient(top, #3498db, #2980b9);
              background-image: -moz-linear-gradient(top, #3498db, #2980b9);
              background-image: -ms-linear-gradient(top, #3498db, #2980b9);
              background-image: -o-linear-gradient(top, #3498db, #2980b9);
              background-image: linear-gradient(to bottom, #3498db, #2980b9);
              -webkit-border-radius: 28;
              -moz-border-radius: 28;
              border-radius: 28px;
              font-family: Arial;
            
              font-size: 20px;
              padding: 10px 20px 10px 20px;
              text-decoration: none;
            }
            
            .btn:hover {
              background: #3cb0fd;
              background-image: -webkit-linear-gradient(top, #3cb0fd, #3498db);
              background-image: -moz-linear-gradient(top, #3cb0fd, #3498db);
              background-image: -ms-linear-gradient(top, #3cb0fd, #3498db);
              background-image: -o-linear-gradient(top, #3cb0fd, #3498db);
              background-image: linear-gradient(to bottom, #3cb0fd, #3498db);
              text-decoration: none;
            }
            
            </style>
        </head>
        
        <body>
            <div class="container">
                <div class="row">
                    <div class="col">
                        <h1 class="mt-4">¡Bienvenido!</h1>
                        <p class="lead">Gracias por registrarte en Cineverse.</p>
                        <p>Por favor, haz clic en el siguiente botón para activar tu cuenta:</p>
                        <a href="${verificationLink}" class="btn" style="color:white;">Activar cuenta</a>
                        <p class="mt-4">Si el botón no funciona, puedes copiar y pegar el siguiente enlace en tu navegador:</p>
                        <p>Enlace de activación: <a href="#">https://example.com/activar</a></p>
                    </div>
                </div>
            </div>
        </body>
        
        </html>`,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ', info);
      return 'Email sent successfully.';
    } catch (error) {
      console.error('Error sending email: ', error);
      throw new Error('Failed to send email.');
    }
  }

}