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

  async getUserById(id: number): Promise<User> {
    const cached = await this.redis.get<User>(`user:${id}`);
    if (cached) {
      return cached;
    }
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.redis.set(`user:${id}`, user);
    return user;
  }

  async getUsers(q: UserQueryDto) {
    const { page, limit, sortBy, order, search } = q;

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

  // async updateUser(dto: UpdateUserDto): Promise<User> {
  //   const updatedUser = this.prisma.user.update({ data: dto });
  //   return updatedUser;
  // }

  async deleteUser(id: number): Promise<User> {
    const user = await this.prisma.user.delete({ where: { id: id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.redis.del(`user:${id}`);
    return user;
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const exist = await this.prisma.user.findUnique({
      where: { email: dto.email, userName: dto.userName },
    });

    if (exist?.email === dto.email) {
      throw new ConflictException('Email already registered');
    } else if (exist?.userName === dto.userName) {
      throw new ConflictException('UserName already registered');
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
