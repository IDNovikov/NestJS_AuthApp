import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '@/modules/auth/shared/decorators/roles.decorator';
import { JwtAuthGuard } from '@/modules/auth/shared/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/shared/guards/roles.guard';
import { AdminFacade } from './admin.facade';
import { ApiTags } from '@nestjs/swagger';
import { UseSwagger } from '../../../common/decorators/swagger.decorator';
import { AuthSwagger } from '../docs/authSwagger.docs';

@ApiTags('AdminAuth')
@Controller('admin')
export class AdminController {
  constructor(private facade: AdminFacade) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('sessions/all')
  @UseSwagger(...AuthSwagger.AdminAllSessions)
  async getAllSessionsByAdmin() {
    return this.facade.getAllSessionsByAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('sessions/:userId')
  @UseSwagger(...AuthSwagger.AdminLogoutUserSessions)
  async logoutUsersSessionsByAdmin(
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.facade.logoutUserSessionsByAdmin(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('sessions/all')
  @UseSwagger(...AuthSwagger.AdminLogoutAllSessions)
  async logoutAllSessionsByAdmin() {
    return this.facade.logoutAllSessionsByAdmin();
  }
}
