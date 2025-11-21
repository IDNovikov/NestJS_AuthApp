import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { SessionsService } from './session.service';

@Injectable()
export class SessionFacade {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionsService: SessionsService,
  ) {}

  async getUserSessions(refreshToken: string) {
    const { sub } = await this.authService.checkRefreshToken(refreshToken);
    const sessions = await this.sessionsService.getSessions(sub);
    const parsedSessions = this.sessionsService.parseSessionsData(sessions);
    return { data: parsedSessions };
  }

  async logoutSession(refreshToken: string, usersDeviceId: string) {
    const { sub } = await this.authService.checkRefreshToken(refreshToken);
    const { value } = await this.sessionsService.getSessions(
      sub,
      usersDeviceId,
    );
    await this.sessionsService.closeSession(value?.jti, sub, usersDeviceId);
    return { message: `Session ${usersDeviceId} is closed` };
  }
}
