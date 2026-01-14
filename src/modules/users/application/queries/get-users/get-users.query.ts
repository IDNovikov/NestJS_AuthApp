import { UserQueryDto } from '@/modules/users/dto/user-query.dto';

export class GetUsersQuery {
  constructor(public readonly dto: UserQueryDto) {}
}
