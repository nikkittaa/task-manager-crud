import { Injectable, Logger } from '@nestjs/common';
import { TaskStatus } from '../../common/enums/taskStatus.enum';
import { Task } from './tasks.entity';
import { TaskRepository } from './tasks.repository';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { User } from '../users/user.entity';
import { RedisService } from '../redis/redis.service';
import { RedisPubSubService } from '../redis/redis-pubsub.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private taskRepository: TaskRepository,
    private readonly redisService: RedisService,
    private readonly redisPubSubService: RedisPubSubService,
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
      this.logger.log(`Cache hit for all tasks of user ${user.id}`);
      return cachedTasks;
    }
    this.logger.log(`Cache miss for all tasks of user ${user.id}`);
    const tasks = await this.taskRepository.getAllTasks(user);
    await this.redisService.set(cacheKey, tasks, 300 * 1000);
    this.logger.debug(`Cached all tasks for user ${user.id}`);
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
    this.logger.log(`Task created: ${task.id} by user ${user.id}, cache invalidated`);

    await this.redisPubSubService.publish('tasks_channel', {
      event: 'task_created',
      data: { id: task.id, title: task.title },
    });
    this.logger.debug(`Published task_created event for task ${task.id}`);

    return task;
  }

  // Cache individual task by id
  async getTaskById(id: string, user: User): Promise<Task> {
    const cacheKey = this.getTaskCacheKey(id);
    const cachedTask = await this.redisService.get<Task>(cacheKey);
    if (cachedTask) {
      this.logger.log(`Cache hit for task ${id}`);
      return cachedTask;
    }
    this.logger.log(`Cache miss for task ${id}`);
    const task = await this.taskRepository.findOne(id, user);
    await this.redisService.set(cacheKey, task, 300 * 1000);
    this.logger.debug(`Cached task ${id}`);
    return task;
  }

  // Cache filtered tasks
  async getTasksWithFilters(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    const cacheKey = this.getFilteredTasksCacheKey(user.id, filterDto);
    const cachedTasks = await this.redisService.get<Task[]>(cacheKey);
    if (cachedTasks) {
      this.logger.log(`Cache hit for filtered tasks of user ${user.id}`);
      return cachedTasks;
    }
    this.logger.log(`Cache miss for filtered tasks of user ${user.id}`);
    const tasks = await this.taskRepository.getTasksWithFilters(filterDto, user);
    await this.redisService.set(cacheKey, tasks, 300 * 1000);
    this.logger.debug(`Cached filtered tasks for user ${user.id}`);
    return tasks;
  }

  async deleteTaskById(id: string, user: User): Promise<Task> {
    const task = await this.taskRepository.deleteTask(id, user);

    // Invalidate caches
    await this.redisService.del(this.getTaskCacheKey(id));
    await this.redisService.delPattern(`user-tasks:${user.id}*`);
    this.logger.log(`Deleted task ${id} and invalidated caches for user ${user.id}`);

    return task;
  }

  async updateTaskStatus(id: string, user: User, status: TaskStatus): Promise<Task> {
    const task = await this.taskRepository.updateTaskStatus(id, user, status);

    // Invalidate caches
    await this.redisService.del(this.getTaskCacheKey(id));
    await this.redisService.delPattern(`user-tasks:${user.id}*`);
    this.logger.log(`Updated status of task ${id} to ${status} and invalidated caches for user ${user.id}`);

    return task;
  }
}
