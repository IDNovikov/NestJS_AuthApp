import { ForbiddenException, Injectable } from '@nestjs/common';
import { SessionsService } from '../session/session.service';

@Injectable()
export class AdminFacade {
  constructor(private readonly sessionsService: SessionsService) {}

  async getAllSessionsByAdmin() {
    const sessions = await this.sessionsService.getSessions();
    const parsedSessions = this.sessionsService.parseSessionsData(
      sessions,
      true,
    );
    return { data: parsedSessions };
  }

  async logoutUserSessionsByAdmin(userId: number) {
    const sessions = await this.sessionsService.getSessions(userId);

    Promise.all([
      sessions.map(async (val) => {
        const { deviceId } = this.sessionsService.keyParser(val.key);
        return this.sessionsService.closeSession(
          val.value.jti,
          userId,
          deviceId,
        );
      }),
    ]);

    return { message: `Session of ${userId} is closed` };
  }

  async logoutAllSessionsByAdmin() {
    const sessions = await this.sessionsService.getSessions();

    Promise.all([
      sessions.map(async (val) => {
        const { deviceId, userId } = this.sessionsService.keyParser(val.key);
        return this.sessionsService.closeSession(
          val.value.jti,
          userId,
          deviceId,
        );
      }),
    ]);

    return { message: `All sessions is closed` };
  }
}
