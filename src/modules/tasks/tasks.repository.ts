import { Repository } from 'typeorm';
import { Task } from './tasks.entity';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskStatus } from '../../common/enums/taskStatus.enum';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { User } from '../users/user.entity';

@Injectable()
export class TaskRepository {
  constructor(
    @InjectRepository(Task)
    private repository: Repository<Task>,
  ) {}

  async findOne(id: string, user: User): Promise<Task> {
    const found = await this.repository.findOne({
      where: { id, userId: user.id },
    });

    if (!found) {
      throw new NotFoundException('Task not found');
    }

    return found;
  }

  async getAllTasks(user: User): Promise<Task[]> {
    const tasks: Task[] = await this.repository.find({
      order: {
        createdAt: 'DESC',
      },
      where: { userId: user.id },
    });
    return tasks;
  }

  async getTasksWithFilters(
    filterDto: GetTasksFilterDto,
    user: User,
  ): Promise<Task[]> {
    const { status, search } = filterDto;
    const query = this.repository.createQueryBuilder('task');
    query.where('task.userId = :userId', { userId: user.id });

    if (status !== undefined) {
      query.andWhere('(task.status = :status)', { status });
    }

    if (search) {
      query.andWhere(
        '(task.title LIKE :search OR task.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    try {
      const tasks = await query.getMany();
      return tasks;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async createTask(
    title: string,
    description: string,
    user: User,
  ): Promise<Task> {
    const task = this.repository.create({
      title,
      description,
      status: TaskStatus.OPEN,
      userId: user.id,
    });

    await this.repository.save(task);
    return task;
  }

  async deleteTask(id: string, user: User): Promise<Task> {
    const found = await this.repository.findOne({
      where: { id, userId: user.id },
    });

    if (!found) {
      throw new NotFoundException('Task not found');
    }

    await this.repository.delete({ id, userId: user.id });
    return found;
  }

  async updateTaskStatus(
    id: string,
    user: User,
    status: TaskStatus,
  ): Promise<Task> {
    const task = await this.findOne(id, user);
    task.status = status;
    await this.repository.save(task);
    return task;
  }
}
