import {
  Body,
  Controller,
  Post,
  Req,
  Res,
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
import { Response } from 'express';
import { CookieInterceptor } from '@/common/interceptors/cookie.interceptor';

@ApiTags('auth')
@ApiCookieAuth('refresh_token')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

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

  @Post('registrate')
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
    const tokens = await this.auth.verifyEmail(dto.id, dto.congfirmedCode);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200 })
  async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
    const userId = req.user?.sub;
    console.log(req.user);
    await this.auth.logout(userId);
    res.clearCookie('refresh_token');
    return { message: 'User logged out' };
  }

  @Post('change-pass')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 200 })
  async changePass(@Body() dto: ChangePasswordDto) {
    await this.auth.changePassword(dto.id, dto.oldPassword, dto.newPassword);
    return { message: 'Password changed succsessed' };
  }

  @Post('get-temp-pass')
  @ApiOperation({ summary: 'Get temp pass from email' })
  @ApiResponse({ status: 200 })
  async getTempPass(@Body() dto: GetTempPassDto) {
    await this.auth.getTempPass(dto.email);
    return { message: 'Password successfully changed. Check your email' };
  }
  @UseInterceptors(CookieInterceptor)
  @Post('refresh-tokens')
  @ApiOperation({ summary: 'Access and refresh tokens' })
  @ApiResponse({ status: 200 })
  async refresh(@Req() req, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    console.log(refreshToken);
    const tokens = await this.auth.refreshTokens(refreshToken);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }
}
