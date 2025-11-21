import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SessionsService } from '../session/session.service';
import { LoginDto } from './dto/login.dto';
import { ISessionData } from '@/modules/auth/shared/types/session.types';

@Injectable()
export class AuthFacade {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionsService: SessionsService,
  ) {}

  //LOGIN
  async login(dto: LoginDto, token: string, sessionData: ISessionData) {
    const { email, password } = dto;
    const { sub: userId, role } = await this.authService.validateUser(
      email,
      password,
      token,
    );
    const { access_token, refresh_token } =
      await this.authService.generateAndUpdateTokens(
        {
          sub: userId,
          email,
          role: role,
        },
        sessionData,
      );

    return {
      message: 'Login successful',
      user: { id: userId, email: email, role: role },
      access_token: access_token,
      refresh_token: refresh_token,
    };
  }
  async refreshTokens(token: string, sessionData: ISessionData) {
    const { sub, email, role, deviceId, jti } =
      await this.authService.checkRefreshToken(token);

    await this.sessionsService.closeSession(jti, sub, deviceId);

    const { access_token, refresh_token } =
      await this.authService.generateAndUpdateTokens(
        {
          sub,
          email,
          role: role,
        },
        sessionData,
      );
    return {
      message: 'Tokens refreshed',
      access_token: access_token,
      refresh_token: refresh_token,
    };
  }

  async logout(refreshtoken: string, jti: string) {
    const { sub, deviceId } =
      await this.authService.checkRefreshToken(refreshtoken);

    await this.sessionsService.closeSession(jti, sub, deviceId);

    return { clear_refresh_cookie: true, message: 'User logged out' };
  }
}
