import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { Media, MediaSchema } from './entities/media.entity';
import { CommentsModule } from 'src/comments/comments.module';

@Module({
  controllers: [MediaController],
  providers: [MediaService],
  
  imports: [
    ConfigModule.forRoot(),
    
    MongooseModule.forFeature([{name: Media.name, schema: MediaSchema}]),

    JwtModule.register({
      global: true,
      secret: process.env.JWT_WORD,
      signOptions: { expiresIn: '6h' },
    }),
    
    AuthModule, CommentsModule
  ]
})
export class MediaModule {}
