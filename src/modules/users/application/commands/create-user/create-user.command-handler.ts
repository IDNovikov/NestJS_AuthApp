import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from './create-user.command';
import { UserAggregate } from '@/modules/users/domain/user.aggregate';

import { DomainError } from '@/common/errors/domain.error';
import { UserRepository } from '@/modules/users/providers/user.repository';
import { ConflictException } from '@nestjs/common';

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler
  implements ICommandHandler<CreateUserCommand, UserAggregate>
{
  constructor(private readonly userRepository: UserRepository) {}
  async execute({ dto }: CreateUserCommand): Promise<UserAggregate> {
    const userAggregate = UserAggregate.create(dto);

    const existingUser = await this.userRepository.findUser({
      email: userAggregate.email,
    });
    if (existingUser?.email === userAggregate.email) {
      throw new ConflictException(`Email already registered`);
    } else if (existingUser?.userName === userAggregate.userName) {
      throw new ConflictException(
        `User name ${existingUser.userName} already exist`,
      );
    }
    const createdUser = await this.userRepository
      .create(userAggregate)
      .catch((err) => {
        throw new DomainError(err, 'User is not valid');
      });
    return createdUser;
  }
}
