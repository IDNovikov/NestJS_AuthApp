import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Roles } from '@/modules/auth/shared/decorators/roles.decorator';
import { RolesGuard } from '@/modules/auth/shared/guards/roles.guard';
import { JwtAuthGuard } from '@/modules/auth/shared/guards/jwt-auth.guard';
import { UserMapper } from './mappers/users.mapper';
import { UseSwagger } from '@/common/decorators/swagger.decorator';
import { UsersSwagger } from './docs/userSwagger.docs';
import { User } from '@/common/decorators/userRefreshToken.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @UseSwagger(...UsersSwagger.getMe)
  async getMe(@User() userId: { sub: number }) {
    const user = await this.usersService.getUser({ id: userId.sub });
    return UserMapper.privateUser(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @UseSwagger(...UsersSwagger.GetUserById)
  async getUserById(@Param('id') id: number) {
    const user = await this.usersService.getUser({ id });
    return UserMapper.safeUser(user);
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  @UseSwagger(...UsersSwagger.GetUsers)
  async getUsers(@Query() q: UserQueryDto) {
    const { items, total, page, limit } = await this.usersService.getUsers(q);

    return {
      items: items.map(UserMapper.safeUser),
      total,
      page,
      limit,
    };
  }
  @UseGuards(JwtAuthGuard)
  @Put()
  @UseSwagger(...UsersSwagger.UpdateUser)
  async update(@User() userId: { sub: number }, @Body() body: UpdateUserDto) {
    const user = await this.usersService.updateUser({ id: userId.sub }, body);
    return UserMapper.privateUser(user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  @UseSwagger(...UsersSwagger.DeleteUser)
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.deleteUser(id);
    return UserMapper.privateUser(user);
  }
  // @UseGuards(JwtAuthGuard)
  // @Post()
  // @UseSwagger(...UsersSwagger.CreateUser)
  // async createUser(@Body() dto: CreateUserDto) {
  //   const user = await this.usersService.createUser(dto);
  //   return UserMapper.privateUser(user);
  // }
}
