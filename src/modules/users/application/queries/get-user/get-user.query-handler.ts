import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserQuery } from './get-user.query';
import { UserAggregate } from '@/modules/users/domain/user.aggregate';

import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { UserRepository } from '@/modules/users/providers/user.repository';

@QueryHandler(GetUserQuery)
export class GetUserQueryHandler
  implements IQueryHandler<GetUserQuery, UserAggregate>
{
  private readonly logger = new Logger(GetUserQueryHandler.name);
  constructor(private readonly UserRepository: UserRepository) {}
  async execute({ id }: GetUserQuery): Promise<UserAggregate> {
    const existUser = await this.UserRepository.findUser({ id }).catch(
      (err) => {
        this.logger.error(err);
        throw new HttpException(
          'Error with repostitory',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      },
    );
    if (!existUser) {
      throw new BadRequestException(`User by id ${id} is not found`);
    }
    return existUser;
  }
}
