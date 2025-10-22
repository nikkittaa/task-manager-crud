import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './tasks.entity';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../users/user.entity';
import { ThrottlerGuard } from '@nestjs/throttler';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { TaskStatus } from 'src/common/enums/taskStatus.enum';

@ApiTags('Tasks')
@ApiBearerAuth() // JWT authentication
@Controller('tasks')
@UseGuards(AuthGuard())
@UseGuards(ThrottlerGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tasks or filtered tasks' })
  @ApiResponse({ status: 200, description: 'List of tasks', type: [Task] })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: TaskStatus,
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  getTasks(
    @Query() filterDto: GetTasksFilterDto,
    @GetUser() user: User,
  ): Promise<Task[]> {
    if (Object.keys(filterDto).length > 0) {
      return this.tasksService.getTasksWithFilters(filterDto, user);
    }

    return this.tasksService.getAllTasks(user);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiResponse({ status: 200, description: 'The task', type: Task })
  @ApiParam({ name: 'id', description: 'Task ID' })
  getTaskById(@Param('id') id: string, @GetUser() user: User): Promise<Task> {
    return this.tasksService.getTaskById(id, user);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, description: 'The created task', type: Task })
  createTask(
    @Body() createTaskDto: CreateTaskDto,
    @GetUser() user: User,
  ): Promise<Task> {
    return this.tasksService.createTask(createTaskDto, user);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete a task by ID' })
  @ApiResponse({ status: 200, description: 'Deleted task', type: Task })
  @ApiParam({ name: 'id', description: 'Task ID' })
  deleteTaskById(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<Task> {
    return this.tasksService.deleteTaskById(id, user);
  }

  @Patch('/:id/status')
  @ApiOperation({ summary: 'Update task status' })
  @ApiBody({ type: UpdateTaskStatusDto })
  @ApiResponse({ status: 200, description: 'Updated task', type: Task })
  @ApiParam({ name: 'id', description: 'Task ID' })
  updateTaskStatus(
    @Param('id') id: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
    @GetUser() user: User,
  ): Promise<Task> {
    return this.tasksService.updateTaskStatus(
      id,
      user,
      updateTaskStatusDto.status,
    );
  }
}
