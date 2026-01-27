import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from '../../users.service';
import { UserGqlEntity } from './models/user-gql.entity';
import { UserFacade } from '../../application/user.facade';
import { UserQueryDto } from '../dto/user-query.dto';
import { PaginatedUsers } from './response/response-with-pagination.gql';
import { CreateUserDto } from '../dto/create-user.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/shared/guards/jwt-auth.guard';


@Resolver(() => UserGqlEntity)
export class UserResolver {
  constructor(
    private userService: UsersService,
    private userFacade: UserFacade,
  ) {}

  //@UseGuards(JwtAuthGuard)
  @Query(() => UserGqlEntity)
  user(@Args('id', { type: () => Int }) id: number) {
    return this.userFacade.queries.getUser(id);
  }

  @Query(() => PaginatedUsers)
  async users(@Args('query') query: UserQueryDto) {
    const { limit = 10, page = 1, order, sortBy, search } = query;
    const { data, total } = await this.userFacade.queries.getUsers({
      page: page,
      limit: limit,
      sortBy: sortBy,
      order: order,
      search: search,
    });
    const users = data.map((u) => ({
      id: Number(u.id),
      email: u.email,
      userName: u.userName,
      telegramId: u.telegramId,
      userImage: u.userImage,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

    return {
      data: users,
      total,
      limit: query.limit,
      offset: (page - 1) * limit,
    };
  }

  @Mutation(() => UserGqlEntity)
  createUser(@Args('input') input: CreateUserDto) {
    return this.userFacade.commands.createUser(input);
  }

  //   @Mutation(() => UserGql)
  // updateUser(@Args('id', { type: () => Int }) id: number, @Args('input') input: UpdateUserDto) {
  //   return this.userService.update(id, input);
  // }

  @Mutation(() => UserGqlEntity)
  removeUser(@Args('id', { type: () => Int }) id: number) {
    return this.userService.deleteUser(id);
  }
}
