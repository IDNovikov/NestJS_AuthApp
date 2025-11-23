import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { SessionData } from '@/modules/auth/shared/decorators/sessionData.decorator';
import { CookieInterceptor } from '@/common/interceptors/cookie.interceptor';
import { RegistrateDto } from './dto/registrate.dto';
import { VerifyDto } from './dto/verify.dto';
import { ISessionData } from '@/modules/auth/shared/types/session.types';
import { EmailDto } from './dto/email.dto';
import { RegistrationFacade } from './registration.facade';
import { ApiTags } from '@nestjs/swagger';
import { UseSwagger } from '../../../common/decorators/swagger.decorator';
import { AuthSwagger } from '../docs/authSwagger.docs';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Registration')
@Controller('registration')
export class RegistrationController {
  constructor(private facade: RegistrationFacade) {}

  @Post()
  @UseSwagger(...AuthSwagger.Registrate)
  @Throttle({
    default: {
      limit: 3,
      ttl: 180,
    },
  })
  async registrate(@Body() dto: RegistrateDto) {
    return this.facade.registrate(dto);
  }

  @UseInterceptors(CookieInterceptor)
  @Post('email/verify')
  @UseSwagger(...AuthSwagger.VerifyEmail)
  async verify(
    @Body() dto: VerifyDto,
    @SessionData() sessionData: ISessionData,
  ) {
    return this.facade.verifyEmail(dto, sessionData);
  }

  @Post('email/new-code')
  @Throttle({
    default: {
      limit: 1,
      ttl: 120,
    },
  })
  @UseSwagger(...AuthSwagger.GetNewCode)
  async getNewVerificationCode(@Body() dto: EmailDto) {
    return this.facade.getNewVerificationCode(dto.email);
  }
}
