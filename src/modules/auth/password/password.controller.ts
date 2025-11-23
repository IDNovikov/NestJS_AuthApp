import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/shared/guards/jwt-auth.guard';
import { User } from '@/common/decorators/userRefreshToken.decorator';
import { ChangePassDto } from './dto/changePass.dto';
import { GetTempPassDto } from './dto/getTempPass.dto';
import { PasswordFacade } from './password.facade';
import { ApiTags } from '@nestjs/swagger';
import { AuthSwagger } from '../docs/authSwagger.docs';
import { UseSwagger } from '../../../common/decorators/swagger.decorator';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Password')
@Controller('password')
export class PasswordController {
  constructor(private facade: PasswordFacade) {}
  @Put('change')
  @Throttle({
    default: {
      limit: 3,
      ttl: 180,
    },
  })
  @UseGuards(JwtAuthGuard)
  @UseSwagger(...AuthSwagger.ChangePass)
  async changePass(@Body() dto: ChangePassDto, @User() user: { sub: number }) {
    return this.facade.changePassword(user.sub, dto);
  }

  @Post('forgot')
  @UseSwagger(...AuthSwagger.ForgotPass)
  async getTempPass(@Body() dto: GetTempPassDto) {
    return this.facade.getTempPass(dto.email);
  }
}
