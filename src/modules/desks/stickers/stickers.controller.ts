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
import { StickersService } from './stickers.service';
import { CreateStickerDto } from './dto/create-sticker.dto';
import { UpdateStickerDto } from './dto/update-sticker.dto';
import { JwtAuthGuard } from '@/modules/auth/shared/guards/jwt-auth.guard';

@Controller('desks/:deskId/stickers')
export class StickersController {
  constructor(private readonly stickers: StickersService) {}
  @UseGuards(JwtAuthGuard)
  @Get()
  async getStickers(@Param(':deskId', ParseIntPipe) boardId: number) {
    return this.stickers.findByDesk(boardId);
  }
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Param(':deskId', ParseIntPipe) deskId: number,
    @Body() dto: CreateStickerDto,
  ) {
    return this.stickers.create(dto, deskId);
  }
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStickerDto,
  ) {
    return this.stickers.update(id, dto);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.stickers.delete(id);
  }
}
