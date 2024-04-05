import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { CommentSchema, Comment } from './entities/comment.entity';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService],
  imports: [
    ConfigModule.forRoot(),
    
    MongooseModule.forFeature([{name: Comment.name, schema: CommentSchema}]),

    JwtModule.register({
      global: true,
      secret: process.env.JWT_WORD,
      signOptions: { expiresIn: '6h' },
    }),
    
    AuthModule
  ], exports: [CommentsService, MongooseModule.forFeature([{name: Comment.name, schema: CommentSchema}]),]
})
export class CommentsModule {}
