import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUsersQuery } from './get-users.query';
import { UserAggregate } from '@/modules/users/domain/user.aggregate';

import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { UserRepository } from '@/modules/users/providers/user.repository';

@QueryHandler(GetUsersQuery)
export class GetUsersQueryHandler
  implements
    IQueryHandler<
      GetUsersQuery,
      {
        data: UserAggregate[];
        total: number;
      }
    >
{
  private readonly logger = new Logger(GetUsersQueryHandler.name);
  constructor(private readonly UserRepository: UserRepository) {}
  async execute({ dto }: GetUsersQuery): Promise<{
    data: UserAggregate[];
    total: number;
  }> {
    const { data, total } = await this.UserRepository.findAll(dto).catch(
      (err) => {
        this.logger.error(err);
        throw new HttpException(
          'Error with repostitory',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      },
    );

    if (!data.length) {
      throw new BadRequestException(`No one users is not found`);
    }
    return { data, total };
  }
}
