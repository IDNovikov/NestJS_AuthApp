import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegistrateDto } from './dto/registrate.dto';
import { VerifyDto } from './dto/verify.dto';
import { GetTempPassDto } from './dto/getTempPass.dto';
import { ChangePasswordDto } from './dto/changePass.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CookieInterceptor } from '@/common/interceptors/cookie.interceptor';
import { User } from '@/common/decorators/userRefreshToken.decorator';
import { RefreshToken } from '@/common/decorators/refreshToken.decorator';
import { RefreshJwtAuthGuard } from '@/common/guards/refresh-jwt-auth.guard';
import { EmailDto } from './dto/onlyEmail.dto';
import {
  ISessionData,
  SessionData,
} from '@/common/decorators/sessionData.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { DeleteSessionDTO } from './dto/logoutSession.dto';

@ApiTags('auth')
@ApiCookieAuth('refresh_token')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrate user' })
  @ApiResponse({ status: 200, description: 'Return user data' })
  async registrate(@Body() dto: RegistrateDto) {
    return this.auth.registrate(dto.userName, dto.email, dto.password);
  }

  @UseInterceptors(CookieInterceptor)
  @Post('verify-email')
  @ApiOperation({ summary: 'Verify new users email' })
  @ApiResponse({ status: 200, description: 'Return user data and tokens' })
  async verify(
    @Body() dto: VerifyDto,
    @SessionData() sessionData: ISessionData,
  ) {
    return this.auth.verifyEmail(dto.email, dto.congfirmedCode, sessionData);
  }

  @Post('get-new-verify-code')
  @ApiOperation({ summary: 'Get new code' })
  @ApiResponse({ status: 200, description: 'Only status and message' })
  async getNewVerificationCode(@Body() dto: EmailDto) {
    return this.auth.getNewVerificationCode(dto.email);
  }

  @UseInterceptors(CookieInterceptor)
  @Post('login')
  @ApiOperation({ summary: 'Login by email & pass' })
  @ApiResponse({
    status: 200,
    description: 'Refresh token set in cookie',
    headers: {
      'Set-Cookie': {
        description: 'HTTP-only refresh token',
        schema: {
          type: 'string',
          example: 'refreshToken=abc123; HttpOnly; Path=/;',
        },
      },
    },
  })
  async login(
    @Body() dto: LoginDto,
    @SessionData() sessionData: ISessionData,
    @RefreshToken() token: string,
  ) {
    return this.auth.validateUser(dto.email, dto.password, token, sessionData);
  }

  @UseInterceptors(CookieInterceptor)
  @Post('refresh-tokens')
  @UseGuards(RefreshJwtAuthGuard)
  @ApiOperation({ summary: 'Access and refresh tokens' })
  @ApiResponse({ status: 200 })
  async refresh(
    @RefreshToken() token: string,
    @SessionData() sessionData: ISessionData,
  ) {
    return this.auth.refreshTokens(token, sessionData);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 200 })
  async changePass(
    @Body() dto: ChangePasswordDto,
    @User() user: { sub: number; email: string; role: string },
  ) {
    return this.auth.changePassword(user.sub, dto.oldPassword, dto.newPassword);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Get temp pass from email' })
  @ApiResponse({ status: 200 })
  async getTempPass(@Body() dto: GetTempPassDto) {
    return this.auth.getTempPass(dto.email);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get active user sessions' })
  @ApiResponse({ status: 200 })
  async getUserSessions(@User() user: any) {
    return this.auth.getUserSessions(user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('all-sessions')
  async getAllSessionsByAdmin() {
    return this.auth.getAllSessionsByAdmin();
  }

  //logout
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('logout-user/:id')
  async logoutUsersSessionsByAdmin(@Param('id', ParseIntPipe) userId: number) {
    return this.auth.logoutUserSessionsByAdmin(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('logout-all')
  async logoutAllSessionsByAdmin() {
    return this.auth.logoutAllSessionsByAdmin();
  }

  @Post('logout-session')
  @UseGuards(JwtAuthGuard)
  async logoutSession(@Query() params: DeleteSessionDTO) {
    return this.auth.logoutSession(Number(params.id), params.deviceId);
  }

  @UseInterceptors(CookieInterceptor)
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200 })
  async logout(
    @RefreshToken() token: string,
    @User() user: { sub: number; email: string; role: string; jti: string },
  ) {
    return this.auth.logout(user.sub, token, user.jti);
  }
}
