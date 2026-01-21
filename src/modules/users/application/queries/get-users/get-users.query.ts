import { UserQueryDto } from '@/modules/users/api/dto/user-query.dto';

export class GetUsersQuery {
  constructor(public readonly dto: UserQueryDto) {}
}
