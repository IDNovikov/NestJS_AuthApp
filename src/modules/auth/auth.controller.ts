import { Body, Controller, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegistrateDto } from './dto/registrate.dto';
import { VerifyDto } from './dto/verify.dto';
import { GetTempPassDto } from './dto/getTempPass.dto';
import { ChangePasswordDto } from './dto/changePass.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login by email' })
  @ApiResponse({ status: 200, description: 'Return user data and tokens' })
  async login(@Body() dto: LoginDto) {
    const user = await this.auth.validateUser(dto.email, dto.password);
    return this.auth.login({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
  }

  @Post('registrate')
  @ApiOperation({ summary: 'Registrate user' })
  @ApiResponse({ status: 200, description: 'Return user data' })
  async registrate(@Body() dto: RegistrateDto) {
    return this.auth.registrate(dto.userName, dto.email, dto.password);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify new users email' })
  @ApiResponse({ status: 200, description: 'Return user data and tokens' })
  async verify(@Body() dto: VerifyDto) {
    return this.auth.verifyEmail(dto.email, dto.congfirmedCode);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200 })
  async logout(@Param('id') id: number) {
    await this.auth.logout(id);
  }

  @Post('change-pass')
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 200 })
  async changePass(@Body() dto: ChangePasswordDto) {
    await this.auth.changePassword(dto.id, dto.oldPassword, dto.newPassword);
  }

  @Post('get-temp-pass')
  @ApiOperation({ summary: 'Get temp pass from email' })
  @ApiResponse({ status: 200 })
  async getTempPass(@Body() dto: GetTempPassDto) {
    await this.auth.getTempPass(dto.email);
  }
}
