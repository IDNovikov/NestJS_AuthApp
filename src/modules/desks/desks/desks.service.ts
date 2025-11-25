import { UpdateDeskDto } from './dto/update-desk.dto';
import { CreateDeskDto } from './dto/create-desk.dto';
import { PrismaService } from '@/modules/core/prisma/prisma.service';
import { RedisService } from '@/modules/core/redis/redis.service';

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { IDesk } from './types/desks.entity';

@Injectable()
export class DesksService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async getUsersDesks(userId: number): Promise<IDesk[]> {
    const desks = await this.prisma.desk.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    if (!desks.length) throw new NotFoundException('Desks not found');
    //придется ждать
    await Promise.all(desks.map((el) => this.redis.set(`desks:${el.id}`, el)));
    return desks;
  }

  async getDeskById(deskId: number) {
    const cached = await this.redis.get(`desk:${deskId}`);
    if (cached) return cached;
    const desk = await this.prisma.desk.findUnique({
      where: { id: deskId },
    });
    if (!desk) throw new NotFoundException('Desk not found');
    await this.redis.set(`desk:${deskId}`, desk);
    return desk;
  }

  async createDesk(userId: number, dto: CreateDeskDto) {
    const desk = await this.prisma.desk.create({
      data: {
        userId,
        name: dto.name,
      },
    });
    if (!desk) throw new NotFoundException('Desk not created');
    await this.redis.del(`desks:${desk.id}`);
    await this.redis.set(`desk:${desk.id}`, desk);
    return desk;
  }

  async updateDesk(userId: number, deskId: number, dto: UpdateDeskDto) {
    const exist = await this.prisma.desk.findUnique({
      where: { id: deskId },
    });
    if (!exist) throw new NotFoundException('Desk not found');
    if (exist.userId !== userId) throw new ForbiddenException('Forbidden');
    const updated = await this.prisma.desk.update({
      where: { id: deskId },
      data: { ...dto },
    });
    await this.redis.set(`desk:${deskId}`, updated);
    await this.redis.del(`desks:user:${userId}`);
    return updated;
  }

  async deleteDesk(userId: number, deskId: number) {
    const exist = await this.prisma.desk.findUnique({
      where: { id: deskId },
    });

    if (!exist) throw new NotFoundException('Desk not found');
    if (exist.userId !== userId) throw new ForbiddenException('Forbidden');
    await this.prisma.desk.delete({ where: { id: deskId } });
    await this.redis.del(`desk:${deskId}`);
    await this.redis.del(`desks:user:${userId}`);
    return { success: true };
  }
}
