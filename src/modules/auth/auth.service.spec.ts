/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '../users/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

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
        AuthService,
        {
          provide: UsersService,
          useValue: {
            validateUserPassword: jest.fn(),
            getUserByUsername: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      usersService.validateUserPassword.mockResolvedValue(true);
      usersService.getUserByUsername.mockResolvedValue(mockUser);

      const result = await service.validateUser('testuser', 'password');

      expect(result).toEqual(mockUser);
      expect(usersService.validateUserPassword).toHaveBeenCalledWith(
        'testuser',
        'password',
      );
    });

    it('should return null if credentials are invalid', async () => {
      usersService.validateUserPassword.mockResolvedValue(false);

      const result = await service.validateUser('testuser', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('signIn', () => {
    it('should return access token for valid credentials', async () => {
      const signInDto = { username: 'testuser', password: 'password' };
      const accessToken = 'jwt-token';

      usersService.validateUserPassword.mockResolvedValue(true);
      usersService.getUserByUsername.mockResolvedValue(mockUser);
      jwtService.sign.mockResolvedValue(accessToken as never);

      const result = await service.signIn(signInDto);

      expect(result).toEqual({ accessToken });
      expect(jwtService.sign).toHaveBeenCalledWith({ username: 'testuser' });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const signInDto = { username: 'testuser', password: 'wrongpassword' };

      usersService.validateUserPassword.mockResolvedValue(false);

      await expect(service.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
