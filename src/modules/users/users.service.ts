import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';
import { RedisService } from '../core/redis/redis.service';
import { Prisma, User } from '@prisma/client';
import { UserQueryDto } from './api/dto/user-query.dto';
import { UserMapper } from './api/mappers/users.mapper';
import { ICreateUserDto } from './api/dto/create-user.dto';
import { IUpdateUserDto } from './api/dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async getUser(identifier: { id: number } | { email: string }): Promise<User> {
    if ('id' in identifier) {
      const cached = await this.redis.get<User>(`user:${identifier.id}`);
      if (cached) return cached;
    }

    const user = await this.prisma.user.findUnique({
      where: identifier,
    });
    if (!user) {
      throw new NotFoundException({ message: 'User not found' });
    }

    await this.redis.set(`user:${user.id}`, UserMapper.safeUser(user));
    return user;
  }

  async getUsers(q: UserQueryDto): Promise<{
    items: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 20, sortBy, order, search } = q;

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

    return { items, total, page, limit };
  }

  async deleteUser(id: number): Promise<User> {
    const user = await this.prisma.user.delete({ where: { id: id } });
    if (!user) {
      throw new NotFoundException({ message: 'User not found' });
    }
    await this.redis.del(`user:${id}`);
    return user;
  }
  //TODO: переработь ДТОшку
  async updateUser(
    identifier: { id: number } | { email: string },
    dto: IUpdateUserDto,
  ): Promise<User> {
    const updatedUser = await this.prisma.user.update({
      where: identifier,
      data: dto,
    });
    if (!updatedUser)
      throw new NotFoundException({ message: 'User was not updated' });
    await this.redis.del(`user:${updatedUser.id}`);
    return updatedUser;
  }

  async createUser(dto: ICreateUserDto): Promise<User> {
    const { email, password, userName } = dto;
    const exist = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { userName: userName }],
      },
    });

    if (exist?.email === email) {
      throw new ConflictException({ message: 'Email already registered' });
    } else if (exist?.userName === userName) {
      throw new ConflictException({ message: 'UserName already registered' });
    }

    const user = await this.prisma.user.create({
      data: {
        userName: userName,
        email: email,
        password: password,
        role: 'USER',
      },
    });

    await this.redis.set(`user:${user.id}`, UserMapper.safeUser(user));
    return user;
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
