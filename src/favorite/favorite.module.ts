import { Module, forwardRef } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { FavoriteController } from './favorite.controller';
import { ConfigModule } from '@nestjs/config';
import { Favorite, FavoriteSchema } from './entities/favorite.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { MediaModule } from 'src/media/media.module';

@Module({
  controllers: [FavoriteController],
  providers: [FavoriteService],
  imports: [
    ConfigModule.forRoot(),
    
    MongooseModule.forFeature([{name: Favorite.name, schema: FavoriteSchema}]),

    JwtModule.register({
      global: true,
      secret: process.env.JWT_WORD,
      signOptions: { expiresIn: '6h' },
    }),
    
    AuthModule, 
    forwardRef(() => MediaModule),
  ], exports: [
    FavoriteService, MongooseModule.forFeature([{name: Favorite.name, schema: FavoriteSchema}]),
  ]
})
export class FavoriteModule {}
