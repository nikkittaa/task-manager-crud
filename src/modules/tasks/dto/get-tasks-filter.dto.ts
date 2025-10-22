import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TaskStatus } from '../../../common/enums/taskStatus.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetTasksFilterDto {
  @IsOptional()
  @ApiProperty({
    example: TaskStatus.OPEN,
    description: 'Status of the task (0 = OPEN, 1 = IN_PROGRESS, 2 = DONE)',
    enum: TaskStatus,
  })
  @Type(() => Number)
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @ApiProperty({ example: 'Search', description: 'Search for a task' })
  @IsString()
  @IsNotEmpty()
  search?: string;
}
