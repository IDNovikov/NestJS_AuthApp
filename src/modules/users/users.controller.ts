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
import {
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Roles } from '@/modules/auth/shared/decorators/roles.decorator';
import { RolesGuard } from '@/modules/auth/shared/guards/roles.guard';
import { JwtAuthGuard } from '@/modules/auth/shared/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // @Get('me')
  //   @ApiOperation({ summary: 'Get user by id' })
  //   @ApiResponse({ status: 200, description: 'Return user data' })
  //   getUserById(@User()user) {
  //     return this.usersService.getUserById(id);
  //   }
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, description: 'Return user data' })
  getUserById(@Param('id') id: number) {
    return this.usersService.getUserById(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get users by params' })
  @ApiResponse({ status: 200, description: 'Return users' })
  getUsers(@Query() q: UserQueryDto) {
    return this.usersService.getUsers(q);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated' })
  update(@Param('id') id: number, @Body() body: UpdateUserDto) {
    return this.usersService.updateUser({ id }, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({
    status: 200,
    description: 'User deleted',
  })
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 200, description: 'Return user data' })
  createUser(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }
}
