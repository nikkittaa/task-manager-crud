import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TaskStatus } from '../../../common/enums/taskStatus.enum';
import { ApiProperty } from '@nestjs/swagger';

export class GetTasksFilterDto {
  @IsOptional()
  @ApiProperty({
    example: TaskStatus.OPEN,
    description: 'Status of the task',
    enum: TaskStatus,
  })
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @ApiProperty({ example: 'Search', description: 'Search for a task' })
  @IsString()
  @IsNotEmpty()
  search?: string;
}
