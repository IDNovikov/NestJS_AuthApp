import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { PrismaService } from '@/modules/core/prisma/prisma.service';
import { RedisService } from '@/modules/core/redis/redis.service';
import { IUser } from '../domain/user.interface';
import { UserAggregate } from '../domain/user.aggregate';
import { UserQueryDto } from '../dto/user-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserAdapter implements UserRepository {
  private readonly logger = new Logger(UserAdapter.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}
  create(user: IUser): Promise<UserAggregate> {
    return;
  }

  update(user: IUser): Promise<UserAggregate> {
    return;
  }
  findOneById(id: string): Promise<UserAggregate> {
    return;
  }
  findFirstByEmailOrName(
    userName: string,
    email: string,
  ): Promise<UserAggregate> {
    return;
  }
  async findAll(
    dto: UserQueryDto,
  ): Promise<{ data: UserAggregate[]; total: number }> {
    const { page = 1, limit = 20, sortBy, order, search } = dto;

    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { userName: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: items.map((item) => UserAggregate.create(item)), total };
  }

  async delete(id: number): Promise<UserAggregate> {
    const user = await this.prisma.user.delete({ where: { id: id } });
    if (!user) {
      throw new NotFoundException({ message: 'User not found' });
    }
    await this.redis.del(`user:${id}`);
    return UserAggregate.create(user);
  }
}
