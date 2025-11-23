import { Controller, Delete, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/shared/guards/jwt-auth.guard';
import { DeleteSessionDTO } from './dto/deleteSession.dto';
import { RefreshToken } from '@/modules/auth/shared/decorators/refreshToken.decorator';
import { SessionFacade } from './session.facade';
import { ApiTags } from '@nestjs/swagger';
import { AuthSwagger } from '../docs/authSwagger.docs';
import { UseSwagger } from '../../../common/decorators/swagger.decorator';

@ApiTags('Sessions')
@Controller('sessions')
export class SessionsController {
  constructor(private facade: SessionFacade) {}
  @Get()
  @UseGuards(JwtAuthGuard)
  @UseSwagger(...AuthSwagger.GetUserSessions)
  async getUserSessions(@RefreshToken() token: string) {
    return this.facade.getUserSessions(token);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @UseSwagger(...AuthSwagger.DeleteSession)
  async logoutSession(
    @RefreshToken() token: string,
    @Query() params: DeleteSessionDTO,
  ) {
    return this.facade.logoutSession(token, params.deviceId);
  }
}
