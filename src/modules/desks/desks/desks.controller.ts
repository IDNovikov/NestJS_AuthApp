import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateDeskDto } from './dto/create-desk.dto';
import { UpdateDeskDto } from './dto/update-desk.dto';
import { DesksService } from './desks.service';
import { JwtAuthGuard } from '@/modules/auth/shared/guards/jwt-auth.guard';
import { User } from '@/common/decorators/userRefreshToken.decorator';

@Controller('desks')
export class DesksController {
  constructor(private readonly desks: DesksService) {}

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async getUsersDesks(@Param('userId', ParseIntPipe) userId: number) {
    return this.desks.getUsersDesks(userId);
  }
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getDeskById(@Param('id', ParseIntPipe) id: number) {
    return this.desks.getDeskById(id);
  }
  @UseGuards(JwtAuthGuard)
  @Post()
  async createDesk(
    @Body() dto: CreateDeskDto,
    @User() userId: { sub: number },
  ) {
    return this.desks.createDesk(userId.sub, dto);
  }
  @UseGuards(JwtAuthGuard)
  @Patch(':deskId')
  async updateDesk(
    @Param('deskId', ParseIntPipe) deskId: number,
    @Body() dto: UpdateDeskDto,
    @User() userId: { sub: number },
  ) {
    return this.desks.updateDesk(userId.sub, deskId, dto);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':deskId')
  async deleteDesk(
    @Param('deskId', ParseIntPipe) deskid: number,
    @User() userId: { sub: number },
  ) {
    return this.desks.deleteDesk(userId.sub, deskid);
  }
}
