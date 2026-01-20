import {
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { UserQueryDto } from '../../dto/user-query.dto';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { CreateUserDto } from '../../dto/create-user.dto';

export class UsersSwagger {
  static getMe = [
    ApiOperation({ summary: 'Get main users page' }),
    ApiOkResponse({
      description: 'Return user data (privateUser)',
      schema: {
        example: {
          id: 12,
          email: 'example@mail.com',
          userName: 'John Doe',
          userImage: 'https://cdn.example.com/user.png',
          isEmailVerified: true,
          telegramId: '123456',
          role: 'USER',
          status: 'DELETED',
          createdAt: '2025-01-18T11:22:30.032Z',
          updatedAt: '2025-11-18T12:45:30.032Z',
        },
      },
    }),
  ];
  static GetUserById = [
    ApiOperation({ summary: 'Get user by ID (safe data)' }),
    ApiOkResponse({
      description: 'Return user data (safeUser)',
      schema: {
        example: {
          id: 12,
          userName: 'John Doe',
          createdAt: '2025-11-18T12:45:30.032Z',
          updatedAt: '2025-11-18T12:45:30.032Z',
          userImage: 'https://cdn.example.com/user.png',
        },
      },
    }),
  ];

  static GetUsers = [
    ApiOperation({ summary: 'Get users with filters' }),
    ApiQuery({
      type: UserQueryDto,
      required: false,
      description: 'Query params for user filtering',
    }),
    ApiOkResponse({
      description: 'Return paginated users',
      schema: {
        example: {
          items: [
            {
              id: 12,
              userName: 'John Doe',
              createdAt: '2025-11-18T12:45:30.032Z',
              updatedAt: '2025-11-18T12:45:30.032Z',
              userImage: 'https://cdn.example.com/user.png',
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
        },
      },
    }),
  ];

  static UpdateUser = [
    ApiOperation({ summary: 'Update user (privateUser)' }),
    ApiBody({
      type: UpdateUserDto,
      examples: {
        example: {
          summary: 'Example request',
          value: {
            userName: 'Updated Name',
            userImage: 'https://cdn.example.com/user.png',
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Updated user (privateUser)',
      schema: {
        example: {
          id: 12,
          email: 'example@mail.com',
          userName: 'Updated Name',
          userImage: 'https://cdn.example.com/user.png',
          isEmailVerified: true,
          telegramId: '12345678',
          role: 'USER',
          status: 'ACTIVE',
          createdAt: '2025-11-18T12:45:30.032Z',
          updatedAt: '2025-11-18T13:00:00.100Z',
        },
      },
    }),
  ];

  static DeleteUser = [
    ApiOperation({ summary: 'Delete user (ADMIN only)' }),
    ApiOkResponse({
      description: 'User deleted (privateUser)',
      schema: {
        example: {
          id: 12,
          email: 'example@mail.com',
          userName: 'John Doe',
          userImage: 'https://cdn.example.com/user.png',
          isEmailVerified: true,
          telegramId: '123456',
          role: 'USER',
          status: 'DELETED',
          createdAt: '2025-01-18T11:22:30.032Z',
          updatedAt: '2025-11-18T12:45:30.032Z',
        },
      },
    }),
  ];

  static CreateUser = [
    ApiOperation({ summary: 'Create new user (privateUser)' }),
    ApiBody({
      type: CreateUserDto,
      examples: {
        example: {
          summary: 'Example request',
          value: {
            email: 'newuser@mail.com',
            password: '123Strong$Pass',
            userName: 'NewUser',
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'User created (privateUser)',
      schema: {
        example: {
          id: 55,
          email: 'newuser@mail.com',
          userName: 'New User',
          userImage: 'https://cdn.example.com/user.png',
          isEmailVerified: false,
          telegramId: null,
          role: 'USER',
          status: 'ACTIVE',
          createdAt: '2025-11-18T12:45:30.032Z',
          updatedAt: '2025-11-18T12:45:30.032Z',
        },
      },
    }),
  ];
}
