import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto';
import { AuthGuard } from './guards/auth.guard';
import { User } from './entities/user.entity';
import { LoginResponse } from './interfaces/login-response';

@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {
    
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('/register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards( AuthGuard )
  @Get()
  findAll( @Request() req: Request) {
    return this.authService.findAll();
  }

  @UseGuards( AuthGuard )
  @Get('user-list/:ban')
  findByBan( @Param('ban') ban: boolean) {
    return this.authService.findByBan(ban);
  }

  @UseGuards(AuthGuard)
  @Get('check-token')
  regenerateToken(@Request() req: Request ):LoginResponse{

    const user = req['user'] as User;
    console.log(user);

    return {
      user:user,
      token: this.authService.getJwtToken({ id: user._id })
    }
  }

  @UseGuards(AuthGuard)
  @Patch('ban-user/:id')
  async banUser(@Param('id') id: string) {
    try {
      
      await this.authService.banUser(id);
      return { message: 'Usuario baneado exitosamente' };
    } catch (error) {
      // Maneja el error en caso de que la verificación del token falle
      return { message: 'Error al banear al usuario' };
    }
  }

  @Patch('renew-password')
  async renewPassword(@Body('email') email: string) {
    try {
      await this.authService.envioCorreoPass(email);
      return { message: 'Correo enviado exitosamente' };
    } catch (error) {
      // Maneja el error en caso de que la verificación del token falle
      return { message: 'Error al modificar la cuenta' };
    }
  }

  @Patch('verify-password')
  async verifyAndUpdatePass(
    @Body('token') token: string,
    @Body('password') password: string) : Promise<{ message: string }> {

    try {
      
      await this.authService.verifyNewPassword(token, password);
      return { message: 'Contraseña actualizada exitosamente' };

    } catch (error) {
      // Maneja el error en caso de que la verificación del token falle
      return { message: 'Error al modificar la cuenta' };
    }

  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(id);
  }

  @Post('activate-account')
  async activateAccount(@Body('token') token: string): Promise<{ message: string }> {
    try {
      await this.authService.verifyTokenAndActivateUser(token);
      return { message: 'Cuenta activada exitosamente' };
    } catch (error) {
      // Maneja el error en caso de que la verificación del token falle
      console.log(error.message);
      return { message: 'Error al activar la cuenta' };
    }
  }


}
