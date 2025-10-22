import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { UsersService } from '../users/users.service';
import { TasksService } from './tasks.service';
import { MailerService } from '@nestjs-modules/mailer';
import { TaskStatus } from '../../common/enums/taskStatus.enum';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';

@Injectable()
export class TaskMailerService {
  private readonly logger = new Logger(TaskMailerService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly tasksService: TasksService,
    private readonly mailerService: MailerService,
  ) {}

  // Runs every Monday at 8:00 AM
  @Cron('00 08 * * 1')
  async sendWeeklyTasks() {
    this.logger.log('Running weekly task email job...');
    const users = await this.usersService.getAllUsers();

    for (const user of users) {
      const tasks = await this.tasksService.getTasksWithFilters(
        { status: TaskStatus.OPEN }  as GetTasksFilterDto,
        user,
      );

      if (!tasks || tasks.length === 0) continue;

      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Your Weekly Task Summary',
        template: 'weekly-tasks',
        context: { user, tasks },
      });

      this.logger.log(`Sent weekly tasks email to ${user.username}`);
    }
  }
}
