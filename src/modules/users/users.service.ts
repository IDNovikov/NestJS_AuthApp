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

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private hashService: HashService,
    private redis: RedisService,
  ) {}

  private readonly safeSelect = {
    id: true,
    email: true,
    userName: true,
    role: true,
    status: true,
    refreshToken: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  async getUserById(id: number, withPassword = false) {
    const cached = await this.redis.get<User>(`user:${id}`);
    if (cached) {
      return cached;
    }
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: withPassword
        ? { ...this.safeSelect, password: true }
        : this.safeSelect,
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
      select: withPassword
        ? { ...this.safeSelect, password: true }
        : this.safeSelect,
    });
    if (!user) {
      throw new NotFoundException({ message: 'User not found' });
    }
    await this.redis.set(`user:${user.id}`, user);
    return user as T extends true
      ? typeof user & { password: string }
      : typeof user;
  }
  async getUsers(q: UserQueryDto) {
    const { page = 1, limit = 20, sortBy, order, search } = q;

    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            {
              email: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              userName: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
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
  //Тогда тут не должен быть только UpdateUserDto, но dto для замены ключа телеграм, замены пароля и тд. Типизация как-то должна быть динамческой и зависть от контекста в котором используется сервис
  async updateUser(id: number, dto: UpdateUserDto) {
    const updatedUser = this.prisma.user.update({
      where: { id },
      data: dto,
      select: this.safeSelect,
    });
    await this.redis.del(`user:${id}`);
    return updatedUser;
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const exist = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { userName: dto.userName }],
      },
    });

    if (exist?.email === dto.email) {
      throw new ConflictException({ message: 'Email already registered' });
    } else if (exist?.userName === dto.userName) {
      throw new ConflictException({ message: 'UserName already registered' });
    }

    const user = await this.prisma.user.create({
      data: {
        userName: dto.userName,
        email: dto.email,
        password: await this.hashService.hash(dto.password),
      },
    });

    await this.redis.del(`user:${user.id}`);
    return user;
  }
}
