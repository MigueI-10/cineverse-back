import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { AuthService } from 'src/auth/auth.service';
import { JwtPayload } from '../interfaces/jwt-payload';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService
  ){}
  async canActivate(context: ExecutionContext):  Promise<boolean> {
    
    const request = context.switchToHttp().getRequest(); //recoge la request de la solicitud
    const token = this.extractTokenFromHeader(request); //extraer el token
    if (!token) {
      throw new UnauthorizedException('No hay token en la peticion');
    }
    try {
      //extraer el payload, que es la parte del token que trae la informacion del usuario
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        token,
        {
          secret: process.env.JWT_WORD //la firma que se uso 
        }
      );
      //extraer el usuario y consultar el usuario en la bd
      const user = await this.authService.findUserById(payload.id)
        if(!user){
          throw new UnauthorizedException('Usuario no existe');
        }else if(!user.isActive){
          throw new UnauthorizedException('El usuario no esta activo');
        }

      request['user'] = user;
    } catch (error){
      console.log(error);
      throw new UnauthorizedException('El token no esta autorizado');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
