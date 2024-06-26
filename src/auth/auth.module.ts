import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { User, UserSchema } from './entities/user.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  
  imports: [
    ConfigModule.forRoot(),
    
    MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),

    JwtModule.register({
      global: true,
      secret: process.env.JWT_WORD,
      signOptions: { expiresIn: '6h' },
    }), HttpModule
  ], exports:[AuthService, MongooseModule.forFeature([{name: User.name, schema: UserSchema}])]
})
export class AuthModule {}
