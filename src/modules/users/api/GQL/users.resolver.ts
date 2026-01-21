import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from '../../users.service';
import { CreateUserInput, UserGqlEntity } from './models/user.gql';
import { UserFacade } from '../../application/user.facade';

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
  async users(
    @Args('search', { type: () => String, nullable: true }) search?: string,
  ) {
    const { items } = await this.userService.getUsers({
      page: 1,
      limit: 100,
      sortBy: 'createdAt',
      order: 'desc',
      search,
    });
    return items;
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
