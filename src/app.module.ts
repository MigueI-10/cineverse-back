import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './auth/entities/user.entity';
import { MediaModule } from './media/media.module';
import { CommentsModule } from './comments/comments.module';
import { SharedModule } from './shared/shared.module';
import { ActorModule } from './actor/actor.module';
import { FavoriteModule } from './favorite/favorite.module';


@Module({
  imports: [AuthModule,
    ConfigModule.forRoot(), 

    MongooseModule.forRoot(process.env.MONGO_URI),
    
      MongooseModule.forFeature([
          { name: User.name, schema: UserSchema }
        ]),
    
      MediaModule,
    
      CommentsModule,
    
      SharedModule,
    
      ActorModule,
    
      FavoriteModule,],
  controllers: [],
  providers: [],
})
export class AppModule {}
