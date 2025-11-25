import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStickerDto } from './dto/create-sticker.dto';
import { UpdateStickerDto } from './dto/update-sticker.dto';
import { PrismaService } from '@/modules/core/prisma/prisma.service';
import { RedisService } from '@/modules/core/redis/redis.service';
import { ISticker } from './types/sticker.entity';
import { StickersGateway } from '../desks.gateway';

@Injectable()
export class StickersService {
  constructor(
    private prisma: PrismaService,
    private gateway: StickersGateway,
    private redis: RedisService,
  ) {}

  async findByDesk(deskId: number): Promise<ISticker[]> {
    const results = await this.redis.getMany<ISticker>(`sticker:${deskId}`);

    const cached = results.flatMap((r) => (r.value ? [r.value] : []));
    if (cached.length) {
      return cached;
    }
    const stickers = await this.prisma.sticker.findMany({
      where: { deskId },
      orderBy: { layer: 'asc' },
    });
    //Ждать загрузки такое себе, но пока так
    await Promise.all(
      stickers.map((el) => this.redis.set(`sticker:${deskId}:${el.id}`, el)),
    );
    return stickers;
  }

  async create(dto: CreateStickerDto, deskId: number) {
    const maxLayer = await this.prisma.sticker.aggregate({
      where: { deskId: deskId },
      _max: { layer: true },
    });

    const layer = (maxLayer._max.layer ?? 0) + 1;

    const sticker = await this.prisma.sticker.create({
      data: {
        deskId: deskId,
        text: dto.text,
        x: dto.x,
        y: dto.y,
        color: dto.color ?? '#ffeb3b',
        layer,
      },
    });

    await this.redis.set(`sticker:${deskId}:${sticker.id}`, sticker);

    await this.gateway.emitStickerCreated(sticker);
    return sticker;
  }

  async update(id: number, dto: UpdateStickerDto) {
    const exist = await this.prisma.sticker.findUnique({ where: { id } });
    if (!exist) throw new NotFoundException('Sticker not found');
    await this.redis.del(`sticker:${exist.deskId}:${exist.id}`);
    const sticker = await this.prisma.sticker.update({
      where: { id },
      data: dto,
    });
    await this.redis.set(`sticker:${sticker.deskId}:${sticker.id}`, sticker);
    await this.gateway.emitStickerUpdated(sticker);
    return sticker;
  }

  async delete(id: number) {
    const exist = await this.prisma.sticker.findUnique({ where: { id } });
    if (!exist) throw new NotFoundException('Sticker not found');
    await this.redis.del(`sticker:${exist.deskId}:${exist.id}`);
    await this.prisma.sticker.delete({ where: { id } });
    await this.gateway.emitStickerDeleted(exist);
    return { success: true };
  }
}
