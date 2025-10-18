import { Injectable } from '@nestjs/common';
import { TaskStatus } from '../../common/enums/taskStatus.enum';
import { Task } from './tasks.entity';
import { TaskRepository } from './tasks.repository';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { User } from '../users/user.entity';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class TasksService {
  constructor(
    private taskRepository: TaskRepository,
    private readonly redisService: RedisService,
  ) {}

  private getUserTasksCacheKey(userId: string) {
    return `user-tasks:${userId}`;
  }

  private getTaskCacheKey(taskId: string) {
    return `task:${taskId}`;
  }

  private getFilteredTasksCacheKey(userId: string, filterDto: GetTasksFilterDto) {
    const { status, search } = filterDto;
    return `user-tasks:${userId}:status:${status || 'all'}:search:${search || 'none'}`;
  }

  // Fetch all tasks with caching
  async getAllTasks(user: User): Promise<Task[]> {
    const cacheKey = this.getUserTasksCacheKey(user.id);
    const cachedTasks = await this.redisService.get<Task[]>(cacheKey);
    if (cachedTasks) {
     // console.log('cache hit');
      return cachedTasks;
    }
   // console.log('cache miss');
    const tasks = await this.taskRepository.getAllTasks(user);
    await this.redisService.set(cacheKey, tasks, 300 * 1000);
    return tasks;
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const task = await this.taskRepository.createTask(
      createTaskDto.title,
      createTaskDto.description,
      user,
    );

    // Invalidate caches related to this user
    await this.redisService.delPattern(`user-tasks:${user.id}*`);

    return task;
  }

  // Cache individual task by id
  async getTaskById(id: string, user: User): Promise<Task> {
    const cacheKey = this.getTaskCacheKey(id);
    const cachedTask = await this.redisService.get<Task>(cacheKey);
    if (cachedTask) return cachedTask;

    const task = await this.taskRepository.findOne(id, user);
    await this.redisService.set(cacheKey, task, 300 * 1000);

    return task;
  }

  // Cache filtered tasks
  async getTasksWithFilters(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    const cacheKey = this.getFilteredTasksCacheKey(user.id, filterDto);
    const cachedTasks = await this.redisService.get<Task[]>(cacheKey);
    if (cachedTasks) return cachedTasks;

    const tasks = await this.taskRepository.getTasksWithFilters(filterDto, user);
    await this.redisService.set(cacheKey, tasks, 300 * 1000);

    return tasks;
  }

  async deleteTaskById(id: string, user: User): Promise<Task> {
    const task = await this.taskRepository.deleteTask(id, user);

    // Invalidate caches
    await this.redisService.del(this.getTaskCacheKey(id));
    await this.redisService.delPattern(`user-tasks:${user.id}*`);

    return task;
  }

  async updateTaskStatus(id: string, user: User, status: TaskStatus): Promise<Task> {
    const task = await this.taskRepository.updateTaskStatus(id, user, status);

    // Invalidate caches
    await this.redisService.del(this.getTaskCacheKey(id));
    await this.redisService.delPattern(`user-tasks:${user.id}*`);

    return task;
  }
}
