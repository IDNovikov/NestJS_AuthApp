import {
  Body,
  Controller,
  Post,
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
  async verify(@Body() dto: VerifyDto) {
    const { userId, email, role, tokens } = await this.auth.verifyEmail(
      dto.email,
      dto.congfirmedCode,
    );

    return {
      user: { userId, email, role },
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  @Post('get-new-verify-code')
  @ApiOperation({ summary: 'Get new code' })
  @ApiResponse({ status: 200, description: 'Only status and message' })
  async getNewVerificationCode(@Body() dto: EmailDto) {
    return await this.auth.getNewVerificationCode(dto.email);
  }

  @UseInterceptors(CookieInterceptor)
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200 })
  async logout(@User() user: { sub: number; email: string; role: string }) {
    await this.auth.logout(user.sub);
    return { clear_refresh_cookie: true, message: 'User logged out' };
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
  async login(@Body() dto: LoginDto) {
    const user = await this.auth.validateUser(dto.email, dto.password);

    const tokens = await this.auth.login({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'Login successful',
      user: { id: user.id, email: user.email, role: user.role },
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  @UseInterceptors(CookieInterceptor)
  @Post('refresh-tokens')
  @UseGuards(RefreshJwtAuthGuard)
  @ApiOperation({ summary: 'Access and refresh tokens' })
  @ApiResponse({ status: 200 })
  async refresh(@RefreshToken() token: string) {
    const tokens = await this.auth.refreshTokens(token);
    return {
      message: 'Tokens refreshed',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 200 })
  async changePass(
    @Body() dto: ChangePasswordDto,
    @User() user: { sub: number; email: string; role: string },
  ) {
    await this.auth.changePassword(user.sub, dto.oldPassword, dto.newPassword);
    return { message: 'Password changed succsessed' };
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Get temp pass from email' })
  @ApiResponse({ status: 200 })
  async getTempPass(@Body() dto: GetTempPassDto) {
    await this.auth.getTempPass(dto.email);
    return { message: 'Password successfully changed. Check your email' };
  }

  // @Get('sessions')
  // @UseGuards(JwtAuthGuard)
  //@ApiOperation({ summary: 'Get active user sessions' })
  //@ApiResponse({ status: 200 })
  // async getUserSessions(@User() user: { sub: number; email: string; role: string }){
  //   async this.auth.getUserSessions(user.sub)
  //Получить список активных устройств юзера
  // }

  // @Get('all-sessions')
  // async getAllSessions(){
  //   async this.auth.getAllSessions()
  //АДМИН роут получить все активные сессии
  // }

  //Может либо админ, либо сам юзер
  //@Post('logoutUser')
  // async logoutAll(){
  //   async this.auth.logoutUser()
  //Просто удаляем все рефреш токены юзера
  // }
  //@Post('logout-all')
  // async logoutAll(){
  //   async this.auth.logoutAll()
  //Завершить все сессии всех пользователей
  // }
}
