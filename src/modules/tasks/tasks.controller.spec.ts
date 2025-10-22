/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from './tasks.entity';
import { User } from '../users/user.entity';
import { TaskStatus } from '../../common/enums/taskStatus.enum';
import { AuthGuard } from '@nestjs/passport';
import { ThrottlerGuard } from '@nestjs/throttler';

describe('TasksController', () => {
  let controller: TasksController;
  let tasksService: jest.Mocked<TasksService>;

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
  } as Task;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: {
            getAllTasks: jest.fn(),
            getTasksWithFilters: jest.fn(),
            getTaskById: jest.fn(),
            createTask: jest.fn(),
            deleteTaskById: jest.fn(),
            updateTaskStatus: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard())
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<TasksController>(TasksController);
    tasksService = module.get(TasksService);
  });

  describe('getTasks', () => {
    it('should return all tasks when no filters provided', async () => {
      const tasks = [mockTask];
      tasksService.getAllTasks.mockResolvedValue(tasks);

      const result = await controller.getTasks({}, mockUser);

      expect(result).toBe(tasks);
      expect(tasksService.getAllTasks).toHaveBeenCalledWith(mockUser);
    });

    it('should return filtered tasks when filters provided', async () => {
      const filterDto = { status: TaskStatus.OPEN };
      const tasks = [mockTask];
      tasksService.getTasksWithFilters.mockResolvedValue(tasks);

      const result = await controller.getTasks(filterDto, mockUser);

      expect(result).toBe(tasks);
      expect(tasksService.getTasksWithFilters).toHaveBeenCalledWith(
        filterDto,
        mockUser,
      );
    });
  });

  describe('getTaskById', () => {
    it('should return task by id', async () => {
      tasksService.getTaskById.mockResolvedValue(mockTask);

      const result = await controller.getTaskById('task-1', mockUser);

      expect(result).toBe(mockTask);
      expect(tasksService.getTaskById).toHaveBeenCalledWith('task-1', mockUser);
    });
  });

  describe('createTask', () => {
    it('should create and return new task', async () => {
      const createTaskDto = {
        title: 'New Task',
        description: 'New Description',
      };
      tasksService.createTask.mockResolvedValue(mockTask);

      const result = await controller.createTask(createTaskDto, mockUser);

      expect(result).toBe(mockTask);
      expect(tasksService.createTask).toHaveBeenCalledWith(
        createTaskDto,
        mockUser,
      );
    });
  });

  describe('deleteTaskById', () => {
    it('should delete and return task', async () => {
      tasksService.deleteTaskById.mockResolvedValue(mockTask);

      const result = await controller.deleteTaskById('task-1', mockUser);

      expect(result).toBe(mockTask);
      expect(tasksService.deleteTaskById).toHaveBeenCalledWith(
        'task-1',
        mockUser,
      );
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task status and return task', async () => {
      const updateDto = { status: TaskStatus.IN_PROGRESS };
      const updatedTask = { ...mockTask, status: TaskStatus.IN_PROGRESS };
      tasksService.updateTaskStatus.mockResolvedValue(updatedTask);

      const result = await controller.updateTaskStatus(
        'task-1',
        updateDto,
        mockUser,
      );

      expect(result).toBe(updatedTask);
      expect(tasksService.updateTaskStatus).toHaveBeenCalledWith(
        'task-1',
        mockUser,
        TaskStatus.IN_PROGRESS,
      );
    });
  });
});
