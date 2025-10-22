import { IsEnum } from 'class-validator';
import { TaskStatus } from '../../../common/enums/taskStatus.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTaskStatusDto {
  @ApiProperty({
    example: TaskStatus.IN_PROGRESS,
    description: 'Status of the task (0 = OPEN, 1 = IN_PROGRESS, 2 = DONE)',
    enum: TaskStatus,
  })
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
