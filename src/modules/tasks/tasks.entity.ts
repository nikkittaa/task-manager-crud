import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TaskStatus } from '../../common/enums/taskStatus.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Task {
  @ApiProperty({ example: '<uuid>', description: 'Task ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Task Title', description: 'Title of the task' })
  @Column()
  title: string;

  @ApiProperty({
    example: 'Task Description',
    description: 'Detailed description',
  })
  @Column()
  description: string;

  @ApiProperty({
    example: TaskStatus.OPEN,
    description: 'Status of the task',
    enum: TaskStatus,
    default: TaskStatus.OPEN,
  })
  @Column()
  status: TaskStatus;

  @ApiProperty({ example: '<uuid>', description: 'User ID' })
  @Column()
  userId: string;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: 'Creation date',
  })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: 'Last update date',
  })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
