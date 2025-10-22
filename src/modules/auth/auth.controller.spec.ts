/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signIn: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  describe('signIn', () => {
    it('should return access token', async () => {
      const signInDto = { username: 'testuser', password: 'password' };
      const result = { accessToken: 'jwt-token' };

      authService.signIn.mockResolvedValue(result);

      const response = await controller.signIn(signInDto);
      expect(response).toBe(result);

      expect(authService.signIn).toHaveBeenCalledWith(signInDto);
    });
  });
});
