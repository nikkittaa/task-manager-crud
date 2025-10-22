import { Module } from '@nestjs/common';
import { TasksModule } from './modules/tasks/tasks.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import redisConfig from './config/redis.config';
import { RedisModule } from './modules/redis/redis.module';
import { ThrottlerGuard, ThrottlerModule} from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppService } from './app.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ScheduleModule } from '@nestjs/schedule';


@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        auth: { user: process.env[`stage.${process.env.STAGE}.EMAIL_USER`], pass: process.env[`stage.${process.env.STAGE}.EMAIL_PASS`] },
      },
      defaults: { from: '"Task Manager" <' + process.env[`stage.${process.env.STAGE}.EMAIL_USER`] + '>' },
      template: {
        dir:  __dirname + '/../src/modules/tasks/templates',
        adapter: new HandlebarsAdapter(),
        options: { strict: true },
      },
    }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: [`.env.stage.${process.env.STAGE}`],
      isGlobal: true,
      load: [redisConfig],
    }),
    CacheModule.register({
       isGlobal: true,
       ttl: 60*1000,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          type: 'mysql',
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 3, // 3 requests per second
      },
      {
        name: 'medium', 
        ttl: 10000, // 10 seconds
        limit: 20, // 20 requests per 10 seconds
      },
      {
        name: 'long',
        ttl: 60000, // 1 minute  
        limit: 100, // 100 requests per minute
      }
    ]),
    TasksModule,
    UsersModule,
    AuthModule,
    RedisModule,
  ],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    
    },
  ],
})
export class AppModule {}