import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessTokenGuard } from './core/guards/access-token.guard';
import { IsUUIDGuard } from './core/guards/is-uuid.guard';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { FilesModule } from './files/files.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'postgres',
      password: 'postgres',
      database: 'skillhub_db',
      autoLoadEntities: true,
      synchronize: true,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
    }),
    UserModule,
    AuthModule,
    PostsModule,
    // MulterModule.register({
    //   dest: './uploads',
    // }),
    FilesModule,
    CommentsModule,
  ],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: AccessTokenGuard,
    },
    {
      provide: 'APP_GUARD',
      useClass: IsUUIDGuard,
    },
  ],
})
export class AppModule {}
