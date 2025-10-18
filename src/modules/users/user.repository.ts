import { Repository } from 'typeorm';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
  ) {}

  async getUserById(id: string): Promise<User> {
    const user = await this.repository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  

  async createUser(username: string, password: string): Promise<User> {
    const salt = await bcrypt.genSalt();
    const encryptedPassword = await bcrypt.hash(password, salt);
    const user = await this.repository.create({
      username,
      password: encryptedPassword,
    });

    try {
      const result = await this.repository.save(user);
      return result;
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException('Something went wrong!!!!');
      }
    }
  }

  async validateUserPassword(id: string, password: string): Promise<boolean> {
    const user = await this.getUserById(id);
    if (!user) {
      return false;
    }
    return bcrypt.compare(password, user.password);
  }
}
