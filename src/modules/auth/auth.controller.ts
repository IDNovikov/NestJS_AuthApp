import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegistrateDto } from './dto/registrate.dto';
import { VerifyDto } from './dto/verify.dto';

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
  async registrate(@Body() dto: RegistrateDto) {}

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify new users email' })
  @ApiResponse({ status: 200, description: 'Return user data and tokens' })
  async verify(@Body() dto: VerifyDto) {
    return this.auth.verifyEmail(dto.email, dto.congfirmedCode);
  }

  // @Post('logout')
  // @ApiOperation({ summary: 'Logout user' })
  // @ApiResponse({ status: 200 })
  // async logout(@Param('id') id: number) {
  //   await this.auth.logout(id);
  // }

  // @Post("forgot-pass")
  // @ApiOperation({summary:'Change password with email confirmation'})
  // @ApiResponse({ status: 200 })
  // async
}
