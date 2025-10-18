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


@Injectable()
export class TaskRepository {
  constructor(
    @InjectRepository(Task)
    private repository: Repository<Task>,
  ) {}

  async findOne(id: string): Promise<Task> {
    const found = await this.repository.findOne({ where: { id} });

    if (!found) {
      throw new NotFoundException('Task not found');
    }

    return found;
  }

  async getAllTasks(): Promise<Task[]> {
    return this.repository.find();
  }

  async getTasksWithFilters(
    filterDto: GetTasksFilterDto,
  ): Promise<Task[]> {
    const { status, search } = filterDto;
    const query = this.repository.createQueryBuilder('task');


    if (status) {
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
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async createTask(
    title: string,
    description: string,
  ): Promise<Task> {
    const task = await this.repository.create({
      title,
      description,
      status: TaskStatus.OPEN,
    });

    await this.repository.save(task);
    return task;
  }

  async deleteTask(id: string): Promise<Task> {
    const found = await this.repository.findOne({ where: { id} });

    if (!found) {
      throw new NotFoundException('Task not found');
    }

    await this.repository.delete({id});
    return found;
  
  }

  async updateTaskStatus(
    id: string,
    status: TaskStatus,
  ): Promise<Task> {
    const task = await this.findOne(id);
    task.status = status;
    await this.repository.save(task);
    return task;
  }
}