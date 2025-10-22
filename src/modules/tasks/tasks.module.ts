import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TaskRepository } from './tasks.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './tasks.entity';
import { AuthModule } from '../auth/auth.module';
import { TaskMailerService } from './tasks-mailer.service';
import { UsersModule } from '../users/users.module';
import { MailerModule } from '@nestjs-modules/mailer';
@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    AuthModule,
    UsersModule,
    MailerModule,
  ],
  controllers: [TasksController],
  providers: [TasksService, TaskRepository, TaskMailerService],
})
export class TasksModule {}
