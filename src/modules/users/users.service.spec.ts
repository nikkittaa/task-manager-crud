/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserRepository } from './user.repository';
import { User } from './user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<UserRepository>;

  const mockUser: User = {
    id: '1',
    username: 'testuser',
    password: 'hashedpassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: {
            getUserById: jest.fn(),
            getUserByUsername: jest.fn(),
            createUser: jest.fn(),
            validateUserPassword: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(UserRepository);
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      userRepository.getUserById.mockResolvedValue(mockUser);

      const result = await service.getUserById('1');

      expect(result).toEqual(mockUser);
      expect(userRepository.getUserById).toHaveBeenCalledWith('1');
    });
  });

  describe('getUserByUsername', () => {
    it('should return user by username', async () => {
      userRepository.getUserByUsername.mockResolvedValue(mockUser);

      const result = await service.getUserByUsername('testuser');

      expect(result).toEqual(mockUser);
      expect(userRepository.getUserByUsername).toHaveBeenCalledWith('testuser');
    });
  });

  describe('createUser', () => {
    it('should create and return new user', async () => {
      const createUserDto = {
        username: 'newuser',
        password: 'password123',
        email: 'newuser@example.com',
      };
      userRepository.createUser.mockResolvedValue(mockUser);

      const result = await service.createUser(createUserDto);

      expect(result).toEqual(mockUser);
      expect(userRepository.createUser).toHaveBeenCalledWith(
        'newuser',
        'password123',
        'newuser@example.com',
      );
    });
  });

  describe('validateUserPassword', () => {
    it('should return true for valid password', async () => {
      userRepository.validateUserPassword.mockResolvedValue(true);

      const result = await service.validateUserPassword('testuser', 'password');

      expect(result).toBe(true);
      expect(userRepository.validateUserPassword).toHaveBeenCalledWith(
        'testuser',
        'password',
      );
    });

    it('should return false for invalid password', async () => {
      userRepository.validateUserPassword.mockResolvedValue(false);

      const result = await service.validateUserPassword(
        'testuser',
        'wrongpassword',
      );

      expect(result).toBe(false);
    });
  });
});
