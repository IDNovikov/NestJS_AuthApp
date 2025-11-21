import { ISessionData } from '@/modules/auth/shared/types/session.types';
import { AuthService } from '../auth/auth.service';
import { RegistrateDto } from './dto/registrate.dto';
import { VerifyDto } from './dto/verify.dto';
import { RegistrationService } from './registration.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RegistrationFacade {
  constructor(
    private readonly registrationService: RegistrationService,
    private readonly authService: AuthService,
  ) {}

  async registrate(dto: RegistrateDto) {
    const { userName, email, password } = dto;

    const user = await this.registrationService.registrate(
      userName,
      email,
      password,
    );

    const { codeExpired } = await this.registrationService.sendEmailCode(email);

    return {
      email: user.email,
      expiresTime: codeExpired,
      message: 'User created. Check your email for verification code.',
    };
  }

  async verifyEmail(dto: VerifyDto, sessionData: ISessionData) {
    const { email, confirmCode } = dto;

    const user = await this.registrationService.checkIsUserVerified(email);

    await this.registrationService.verifyEmail(user.id, email, confirmCode);

    const { access_token, refresh_token } =
      await this.authService.generateAndUpdateTokens(
        {
          sub: user.id,
          email,
          role: user.role,
        },
        sessionData,
      );

    return {
      user: {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      access_token: access_token,
      refresh_token: refresh_token,
    };
  }

  async getNewVerificationCode(email: string) {
    const user = await this.registrationService.checkIsUserVerified(email);

    const { codeExpired } = await this.registrationService.sendEmailCode(email);

    return {
      email: user.email,
      expiresTime: codeExpired,
      message: 'Check your email for verification code.',
    };
  }
}
