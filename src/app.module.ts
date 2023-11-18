import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessTokenGuard } from './core/guards/access-token.guard';
import { IsUUIDGuard } from './core/guards/is-uuid.guard';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { FilesModule } from './files/files.module';
import { CommentsModule } from './comments/comments.module';
import { ArticlesModule } from './articles/articles.module';
import { PostLikesModule } from './post-likes/post-likes.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'skillhub_db',
      autoLoadEntities: true,
      synchronize: true,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
    }),
    UserModule,
    AuthModule,
    PostsModule,
    FilesModule,
    CommentsModule,
    ArticlesModule,
    PostLikesModule,
  ],
  providers: [
    // {
    //   provide: 'APP_GUARD',
    //   useClass: AccessTokenGuard,
    // },
    {
      provide: 'APP_GUARD',
      useClass: IsUUIDGuard,
    },
  ],
})
export class AppModule {}
