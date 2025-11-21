import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';
import { HashService } from '../auth/hash.service';
import { RedisService } from '../core/redis/redis.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Prisma, User } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { safeSelect, SafeUser } from './types/user.types';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private hashService: HashService,
    private redis: RedisService,
  ) {}

  async getUserById(
    id: number,
    withPassword: true,
  ): Promise<User & { password: string }>;
  async getUserById(
    id: number,
    withPassword?: false,
  ): Promise<Omit<User, 'password'>>;
  async getUserById(id: number, withPassword = false) {
    const cached = await this.redis.get<User>(`user:${id}`);
    if (cached) return cached;

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: withPassword ? { ...safeSelect, password: true } : safeSelect,
    });

    if (!user) {
      throw new NotFoundException({ message: 'User not found' });
    }

    await this.redis.set(`user:${id}`, user);
    return user;
  }

  async getUserByEmail<T extends boolean = false>(
    email: string,
    withPassword?: T,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: withPassword ? { ...safeSelect, password: true } : safeSelect,
    });
    if (!user) {
      throw new NotFoundException({ message: 'User not found' });
    }
    await this.redis.set(`user:${user.id}`, user);
    return user as T extends true
      ? typeof user & { password: string }
      : typeof user;
  }
  async getUsers(q: UserQueryDto): Promise<{
    items: Omit<User, 'password'>[];
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
        select: safeSelect,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items: items as any, total, page, limit };
  }

  async deleteUser(id: number): Promise<User> {
    const user = await this.prisma.user.delete({ where: { id: id } });
    if (!user) {
      throw new NotFoundException({ message: 'User not found' });
    }
    await this.redis.del(`user:${id}`);
    return user;
  }
  //Тогда тут не должен быть только UpdateUserDto, но dto для замены ключа телеграм, замены пароля и тд. Типизация как-то должна быть динамческой и зависть от контекста в котором используется сервис
  async updateUser(
    identifier: { id: number } | { email: string },
    dto: Prisma.UserUpdateInput,
  ): Promise<SafeUser> {
    const updatedUser = await this.prisma.user.update({
      where: identifier,
      data: dto,
      select: safeSelect,
    });
    if (!updatedUser)
      throw new NotFoundException({ message: 'User was not updated' });
    await this.redis.del(`user:${updatedUser.id}`);
    return updatedUser;
  }

  async createUser({ email, password, userName }): Promise<User> {
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
        password: await this.hashService.hash(password),
        role: 'ADMIN',
      },
    });

    await this.redis.del(`user:${user.id}`);
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

  async makeAdminUser() {}
}
