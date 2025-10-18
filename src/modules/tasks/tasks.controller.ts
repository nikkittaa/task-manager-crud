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
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from '../users/user.entity';
  
  
  @Controller('tasks')
  @UseGuards(AuthGuard())
  export class TasksController {
    constructor(private tasksService: TasksService) {}
  
    @Get()
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
  getTaskById(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<Task> {
    return this.tasksService.getTaskById(id, user);
  }
  
  
  @Post()
  createTask(
    @Body() createTaskDto: CreateTaskDto,
    @GetUser() user: User,
  ): Promise<Task> {
    
    return this.tasksService.createTask(createTaskDto, user);
  }
  
  
  @Delete('/:id')
  deleteTaskById(@Param('id') id: string, @GetUser() user: User): Promise<Task> {
    return this.tasksService.deleteTaskById(id, user);
  }
  
  @Patch('/:id/status')
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