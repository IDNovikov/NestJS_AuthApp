import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RefreshToken } from '@/modules/auth/shared/decorators/refreshToken.decorator';
import { SessionData } from '@/modules/auth/shared/decorators/sessionData.decorator';
import { CookieInterceptor } from '@/common/interceptors/cookie.interceptor';
import { JwtAuthGuard } from '@/modules/auth/shared/guards/jwt-auth.guard';
import { User } from '@/modules/auth/shared/decorators/userRefreshToken.decorator';
import { RefreshJwtAuthGuard } from '@/modules/auth/shared/guards/refresh-jwt-auth.guard';
import { ISessionData } from '@/modules/auth/shared/types/session.types';
import { LoginDto } from './dto/login.dto';
import { AuthFacade } from './auth.facade';
import { ApiTags } from '@nestjs/swagger';
import { UseSwagger } from '../shared/decorators/swagger.decorator';
import { AuthSwagger } from '../docs/authSwagger.docs';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private facade: AuthFacade) {}

  @UseInterceptors(CookieInterceptor)
  @Throttle({
    default: {
      limit: 5,
      ttl: 180,
    },
  })
  @Post('login')
  @UseSwagger(...AuthSwagger.Login)
  async login(
    @Body() dto: LoginDto,
    @SessionData() sessionData: ISessionData,
    @RefreshToken() token: string,
  ) {
    return this.facade.login(dto, token, sessionData);
  }

  @UseInterceptors(CookieInterceptor)
  @Throttle({
    default: {
      limit: 2,
      ttl: 60,
    },
  })
  @Get('refresh-tokens')
  @UseGuards(RefreshJwtAuthGuard)
  @UseSwagger(...AuthSwagger.RefreshTokens)
  async refresh(
    @RefreshToken() token: string,
    @SessionData() sessionData: ISessionData,
  ) {
    return this.facade.refreshTokens(token, sessionData);
  }

  @UseInterceptors(CookieInterceptor)
  @Delete('logout')
  @UseSwagger(...AuthSwagger.Logout)
  @UseGuards(JwtAuthGuard)
  async logout(@RefreshToken() token: string, @User() user: { jti: string }) {
    return this.facade.logout(token, user.jti);
  }
}
