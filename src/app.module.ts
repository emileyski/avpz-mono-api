import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { AccessTokenGuard } from './core/guards/access-token.guard';
import { IsUUIDGuard } from './core/guards/is-uuid.guard';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { FilesModule } from './files/files.module';
import { CommentsModule } from './comments/comments.module';
import { ArticlesModule } from './articles/articles.module';
import { PostLikesModule } from './post-likes/post-likes.module';
import { ConfigModule } from '@nestjs/config';
// import { ChatModule } from './chat-some/chat.module';
import { ChatModule } from './chat/chat.module';
import { MessageModule } from './message/message.module';
import { AdminPanelModule } from './admin-panel/admin-panel.module';
import authConfig from './config/auth.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [authConfig] }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: +process.env.POSTGRES_PORT || 5432,
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'skillhub_db',
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
    ChatModule,
    MessageModule,
    AdminPanelModule,
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
