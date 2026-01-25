import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { PrismaService } from '@/modules/core/prisma/prisma.service';
import { RedisService } from '@/modules/core/redis/redis.service';
import { IUser } from '../domain/user.interface';
import { UserAggregate } from '../domain/user.aggregate';
import { Prisma } from '@prisma/client';
import { GetUsersDTO } from './dto/get-users.dto';

@Injectable()
export class UserAdapter implements UserRepository {
  private readonly logger = new Logger(UserAdapter.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}
  async create(user: IUser): Promise<UserAggregate> {
    const { email, password, userName } = user;

    const createdUser = await this.prisma.user
      .create({
        data: {
          userName: userName,
          email: email,
          password: password,
          role: 'USER',
        },
      })
      .catch((err) => {
        this.logger.error(err);
        throw new ConflictException(err);
      });
    const userAggregate = UserAggregate.create(createdUser);
    await this.redis.set(`user:${createdUser.id}`, userAggregate);
    return userAggregate;
  }

  async update(user: IUser): Promise<UserAggregate> {
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: user,
    });

    if (!updatedUser)
      throw new NotFoundException({ message: 'User was not updated' });

    const userAggregate = UserAggregate.create(updatedUser);
    await this.redis.del(`user:${updatedUser.id}`);
    await this.redis.set(`user:${updatedUser.id}`, userAggregate);
    return userAggregate;
  }

async findUser(
  { id, email, userName }: { id?: number; email?: string; userName?: string },
): Promise<UserAggregate | null> {

  if (id == null && !email && !userName) return null;

  if (id != null) {
    const cached = await this.redis.get<UserAggregate>(`user:${id}`);
    if (cached) return cached;
  }

  const or: Prisma.UserWhereInput[] = [];
  if (email) or.push({ email });
  if (userName) or.push({ userName });
  if (id != null) or.push({ id });

  const user = await this.prisma.user.findFirst({
    where: { OR: or },
  });

  if (!user) return null;

  const userAggregate = UserAggregate.create(user);
  await this.redis.set(`user:${user.id}`, userAggregate);
  return userAggregate;
}


  async findAll(
    dto: GetUsersDTO,
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
    await this.redis.del(`user:${id}`);
    return UserAggregate.create(user);
  }

  async deleteUnverifiedUsers(): Promise<number> {
    const EXPIRATION_MINUTES = 30;

    const expiredDate = new Date(Date.now() - EXPIRATION_MINUTES * 60000);
    const deleted = await this.prisma.user.deleteMany({
      where: { isEmailVerified: false, createdAt: { lt: expiredDate } },
    });
    return deleted.count;
  }
}
