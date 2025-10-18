import { Injectable } from '@nestjs/common';
import {  TaskStatus } from '../../common/enums/taskStatus.enum';
import { Task } from './tasks.entity';
import { TaskRepository } from './tasks.repository';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { User } from '../users/user.entity';


@Injectable()
export class TasksService {
  constructor(private taskRepository: TaskRepository) {}

  getAllTasks(user: User): Promise<Task[]> {
    return this.taskRepository.getAllTasks(user);
  }

  

  async createTask(
    createTaskToDo: CreateTaskDto,
    user: User,
  ): Promise<Task> {
    return this.taskRepository.createTask(
      createTaskToDo.title,
      createTaskToDo.description,
      user
    );
  }

  async getTaskById(id: string, user: User): Promise<Task> {
    return this.taskRepository.findOne(id, user);
  }


  getTasksWithFilters(
    filterDto: GetTasksFilterDto,
    user: User,
  ): Promise<Task[]> {
    return this.taskRepository.getTasksWithFilters(filterDto, user);
  }

  

   deleteTaskById(id: string, user: User): Promise<Task> {
    return this.taskRepository.deleteTask(id, user);
  }


  updateTaskStatus(
    id: string,
    user: User,
    status: TaskStatus,
  ): Promise<Task> {
    return this.taskRepository.updateTaskStatus(id, user, status);
  }

}