import {
  ApiOperation,
  ApiOkResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { RegistrateDto } from '../registration/dto/registrate.dto';
import { EmailDto } from '../registration/dto/email.dto';
import { LoginDto } from '../auth/dto/login.dto';

export class AuthSwagger {
  //REGISTRATION
  // 1. Register new user
  static Registrate = [
    ApiOperation({ summary: 'Register new user' }),
    ApiBody({
      type: RegistrateDto,
      examples: {
        example: {
          summary: 'Example request',
          value: {
            email: 'example@mail.com',
            password: '123paS$word',
            userName: 'userName',
          },
        },
      },
    }),
    ApiOkResponse({
      schema: {
        example: {
          email: 'example@mail.com',
          expiresTime: '2025-11-18T12:45:30.032Z',
          message: 'User created. Check your email for verification code.',
        },
      },
    }),
  ];
  static GetNewCode = [
    ApiOperation({ summary: 'Request new verification code' }),
    ApiBody({
      type: EmailDto,
      examples: {
        example: {
          value: {
            email: 'example@mail.com',
          },
        },
      },
    }),
    ApiOkResponse({
      schema: {
        example: {
          email: 'example@mail.com',
          expiresTime: '2025-11-18T12:59:49.521Z',
          message: 'Check your email for verification code.',
        },
      },
    }),
  ];

  // 3. Verify email
  static VerifyEmail = [
    ApiOperation({ summary: 'Verify email with code' }),
    ApiBody({
      schema: {
        example: {
          email: 'example@mail.com',
          confirmCode: '123456',
        },
      },
    }),
    ApiOkResponse({
      schema: {
        example: {
          user: {
            userId: 6,
            email: 'example@mail.com',
            role: 'USER',
          },
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    }),
  ];
  //AUTH
  //1. Login
  static Login = [
    ApiOperation({ summary: 'Login user' }),
    ApiBody({
      type: LoginDto,
      examples: {
        example: {
          value: {
            email: 'example@mail.com',
            password: '123paS$word',
          },
        },
      },
    }),
    ApiOkResponse({
      schema: {
        example: {
          message: 'Login successful',
          user: {
            id: 7,
            email: 'example@mail.com',
            role: 'ADMIN',
          },
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVC',
        },
      },
    }),
  ];
  //2.Refresh tokens
  static RefreshTokens = [
    ApiOperation({ summary: 'Refresh tokens' }),
    ApiOkResponse({
      schema: {
        example: {
          message: 'Tokens refreshed',
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI...',
        },
      },
    }),
  ];
  //3. Logout
  static Logout = [
    ApiOperation({ summary: 'Logout user' }),
    ApiOkResponse({
      schema: {
        example: { message: 'User logged out' },
      },
    }),
  ];
  //PASSWORD
  //1. Change password
  static ChangePass = [
    ApiOperation({ summary: 'Change user password' }),
    ApiBody({
      schema: {
        example: {
          oldPassword: '123paS$word',
          newPassword: '123paS$word1',
        },
      },
    }),
    ApiOkResponse({
      schema: {
        example: { message: 'Password successfully changed.' },
      },
    }),
  ];
  //2.Forgot password
  static ForgotPass = [
    ApiOperation({ summary: 'Get temporary password' }),
    ApiBody({
      schema: {
        example: {
          email: 'example@mail.com',
        },
      },
    }),
    ApiOkResponse({
      schema: {
        example: {
          message: 'Password successfully changed. Check your email',
        },
      },
    }),
  ];
  //SESSIONS
  //1. Get users sessions
  static GetUserSessions = [
    ApiOperation({ summary: 'Get user sessions' }),
    ApiOkResponse({
      schema: {
        example: {
          data: [
            {
              userId: '6',
              deviceId: 'uuid',
              session: {
                userAgent: 'Internet Explorer',
                device: 'Iphone 4g',
                location: {
                  ip: '14.88.420.13',
                  city: 'Titsburg',
                  country: 'Alboobia',
                },
              },
            },
          ],
        },
      },
    }),
  ];
  //2. Delete session
  static DeleteSession = [
    ApiOperation({ summary: 'Delete user session' }),
    ApiQuery({
      name: 'deviceId',
      example: '375af541-ac19-437e-82e8-68432c2a3340',
    }),
    ApiOkResponse({
      schema: {
        example: {
          message: 'Session 375af541-ac19-437e-82e8-68432c2a3340 is closed',
        },
      },
    }),
  ];
  //ADMIN
  //1.Get all sessions
  static AdminAllSessions = [
    ApiOperation({
      summary: 'Get all active sessions (ADMIN)',
    }),
    ApiOkResponse({
      schema: {
        example: {
          data: [
            {
              userId: '6',
              deviceId: 'uuid',
              session: {
                userAgent: 'Internet Explorer',
                device: 'Iphone 4g',
                location: {
                  ip: '14.88.420.13',
                  city: 'Titsburg',
                  country: 'Alboobia',
                },
              },
            },
          ],
        },
      },
    }),
  ];
  //2. Logout user sessions
  static AdminLogoutUserSessions = [
    ApiOperation({
      summary: 'Logout all sessions of specific user (ADMIN)',
    }),
    ApiParam({ name: 'userId', example: 8 }),
    ApiOkResponse({
      schema: {
        example: {
          message: 'Session of 8 is closed',
        },
      },
    }),
  ];

  //3. Revoke all sessions
  static AdminLogoutAllSessions = [
    ApiOperation({
      summary: 'Logout ALL sessions (ADMIN)',
    }),
    ApiOkResponse({
      schema: {
        example: { message: 'All sessions is closed' },
      },
    }),
  ];
}
