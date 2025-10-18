import { Injectable } from '@nestjs/common';
import {  TaskStatus } from '../../common/enums/taskStatus.enum';
import { Task } from './tasks.entity';
import { TaskRepository } from './tasks.repository';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';


@Injectable()
export class TasksService {
  constructor(private taskRepository: TaskRepository) {}

  getAllTasks(): Promise<Task[]> {
    return this.taskRepository.getAllTasks();
  }

  

  async createTask(
    createTaskToDo: CreateTaskDto,
  ): Promise<Task> {
    return this.taskRepository.createTask(
      createTaskToDo.title,
      createTaskToDo.description,
    );
  }

  async getTaskById(id: string): Promise<Task> {
    return this.taskRepository.findOne(id);
  }


  getTasksWithFilters(
    filterDto: GetTasksFilterDto,
  ): Promise<Task[]> {
    return this.taskRepository.getTasksWithFilters(filterDto);
  }

  

   deleteTaskById(id: string): Promise<Task> {
    return this.taskRepository.deleteTask(id);
  }


  updateTaskStatus(
    id: string,
    status: TaskStatus,
  ): Promise<Task> {
    return this.taskRepository.updateTaskStatus(id, status);
  }

}