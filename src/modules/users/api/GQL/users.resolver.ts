import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from '../../users.service';
import { UserGqlEntity } from './models/user.gql';
import { UserFacade } from '../../application/user.facade';
import { UserQueryDto } from '../dto/user-query.dto';

@Resolver(() => UserGqlEntity)
export class UserResolver {
  constructor(
    private userService: UsersService,
    private userFacade: UserFacade,
  ) {}

  @Query(() => UserGqlEntity)
  user(@Args('id', { type: () => Int }) id: number) {
    return this.userFacade.queries.getUser(id);
  }

  @Query(() => [UserGqlEntity])
  async users(@Args('query') query: UserQueryDto) {
    const { data, total } = await this.userFacade.queries.getUsers({
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      order: query.order,
      search: query.search,
    });
    return data;
  }

  // @Mutation(() => UserGqlEntity)
  // createUser(@Args('input') input: CreateUserInput) {
  //   return this.userService.createUser(input);
  // }
  //     @Mutation(() => UserGql)
  //   updateUser(@Args('id', { type: () => Int }) id: number, @Args('input') input: UpdateUserDto) {
  //     return this.userService.update(id, input);
  //   }

  @Mutation(() => UserGqlEntity)
  removeUser(@Args('id', { type: () => Int }) id: number) {
    return this.userService.deleteUser(id);
  }
}
