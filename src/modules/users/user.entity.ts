import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @ApiProperty({ example: '<uuid>', description: 'User ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'testuser', description: 'Username' })
  @Column({ unique: true })
  username: string;

  @ApiProperty({ example: 'password', description: 'Password' })
  @Column()
  password: string;

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
