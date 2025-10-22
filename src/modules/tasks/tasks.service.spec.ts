/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './tasks.repository';
import { RedisService } from '../redis/redis.service';
import { RedisPubSubService } from '../redis/redis-pubsub.service';
import { Task } from './tasks.entity';
import { User } from '../users/user.entity';
import { TaskStatus } from '../../common/enums/taskStatus.enum';

describe('TasksService', () => {
  let service: TasksService;
  let taskRepository: jest.Mocked<TaskRepository>;
  let redisService: jest.Mocked<RedisService>;
  let redisPubSubService: jest.Mocked<RedisPubSubService>;

  const mockUser: User = {
    id: 'user-1',
    username: 'testuser',
  } as User;

  const mockTask: Task = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.OPEN,
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Task;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: TaskRepository,
          useValue: {
            getAllTasks: jest.fn(),
            createTask: jest.fn(),
            findOne: jest.fn(),
            getTasksWithFilters: jest.fn(),
            deleteTask: jest.fn(),
            updateTaskStatus: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            delPattern: jest.fn(),
          },
        },
        {
          provide: RedisPubSubService,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    taskRepository = module.get(TaskRepository);
    redisService = module.get(RedisService);
    redisPubSubService = module.get(RedisPubSubService);

    // Mock logger to avoid console output during tests
    jest.spyOn(service['logger'], 'log').mockImplementation();
    jest.spyOn(service['logger'], 'debug').mockImplementation();
  });

  describe('getAllTasks', () => {
    it('should return cached tasks when available', async () => {
      const cachedTasks = [mockTask];
      redisService.get.mockResolvedValue(cachedTasks);

      const result = await service.getAllTasks(mockUser);

      expect(result).toEqual(cachedTasks);
      expect(redisService.get).toHaveBeenCalledWith('user-tasks:user-1');
      expect(taskRepository.getAllTasks).not.toHaveBeenCalled();
    });

    it('should fetch from database and cache when cache miss', async () => {
      const tasks = [mockTask];
      redisService.get.mockResolvedValue(null);
      taskRepository.getAllTasks.mockResolvedValue(tasks);

      const result = await service.getAllTasks(mockUser);

      expect(result).toEqual(tasks);
      expect(taskRepository.getAllTasks).toHaveBeenCalledWith(mockUser);
      expect(redisService.set).toHaveBeenCalledWith(
        'user-tasks:user-1',
        tasks,
        300000,
      );
    });
  });

  describe('createTask', () => {
    it('should create task and invalidate cache', async () => {
      const createTaskDto = {
        title: 'New Task',
        description: 'New Description',
      };
      taskRepository.createTask.mockResolvedValue(mockTask);

      const result = await service.createTask(createTaskDto, mockUser);

      expect(result).toEqual(mockTask);
      expect(taskRepository.createTask).toHaveBeenCalledWith(
        'New Task',
        'New Description',
        mockUser,
      );
      expect(redisService.delPattern).toHaveBeenCalledWith(
        'user-tasks:user-1*',
      );
      expect(redisPubSubService.publish).toHaveBeenCalledWith('tasks_channel', {
        event: 'task_created',
        data: { id: mockTask.id, title: mockTask.title },
      });
    });
  });

  describe('getTaskById', () => {
    it('should return cached task when available', async () => {
      redisService.get.mockResolvedValue(mockTask);

      const result = await service.getTaskById('task-1', mockUser);

      expect(result).toEqual(mockTask);
      expect(redisService.get).toHaveBeenCalledWith('task:task-1');
      expect(taskRepository.findOne).not.toHaveBeenCalled();
    });

    it('should fetch from database and cache when cache miss', async () => {
      redisService.get.mockResolvedValue(null);
      taskRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.getTaskById('task-1', mockUser);

      expect(result).toEqual(mockTask);
      expect(taskRepository.findOne).toHaveBeenCalledWith('task-1', mockUser);
      expect(redisService.set).toHaveBeenCalledWith(
        'task:task-1',
        mockTask,
        300000,
      );
    });
  });

  describe('getTasksWithFilters', () => {
    it('should return cached filtered tasks when available', async () => {
      const filterDto = { status: TaskStatus.OPEN, search: 'test' };
      const cachedTasks = [mockTask];
      redisService.get.mockResolvedValue(cachedTasks);

      const result = await service.getTasksWithFilters(filterDto, mockUser);

      expect(result).toEqual(cachedTasks);
      expect(redisService.get).toHaveBeenCalledWith(
        'user-tasks:user-1:status:OPEN:search:test',
      );
    });
  });

  describe('deleteTaskById', () => {
    it('should delete task and invalidate cache', async () => {
      taskRepository.deleteTask.mockResolvedValue(mockTask);

      const result = await service.deleteTaskById('task-1', mockUser);

      expect(result).toEqual(mockTask);
      expect(taskRepository.deleteTask).toHaveBeenCalledWith(
        'task-1',
        mockUser,
      );
      expect(redisService.del).toHaveBeenCalledWith('task:task-1');
      expect(redisService.delPattern).toHaveBeenCalledWith(
        'user-tasks:user-1*',
      );
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task status and invalidate cache', async () => {
      const updatedTask = { ...mockTask, status: TaskStatus.IN_PROGRESS };
      taskRepository.updateTaskStatus.mockResolvedValue(updatedTask);

      const result = await service.updateTaskStatus(
        'task-1',
        mockUser,
        TaskStatus.IN_PROGRESS,
      );

      expect(result).toEqual(updatedTask);
      expect(taskRepository.updateTaskStatus).toHaveBeenCalledWith(
        'task-1',
        mockUser,
        TaskStatus.IN_PROGRESS,
      );
      expect(redisService.del).toHaveBeenCalledWith('task:task-1');
      expect(redisService.delPattern).toHaveBeenCalledWith(
        'user-tasks:user-1*',
      );
    });
  });
});
