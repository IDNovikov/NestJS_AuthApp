import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from './create-user.command';
import { UserAggregate } from '@/modules/users/domain/user.aggregate';
import { UserRepository } from '@/modules/users/repository/user.repository';
import { DomainError } from '@/common/errors/domain.error';

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler
  implements ICommandHandler<CreateUserCommand, UserAggregate>
{
  constructor(private readonly userRepository: UserRepository) {}
  async execute({ user }: CreateUserCommand): Promise<UserAggregate> {
    const userAggregate = UserAggregate.create(user);
    const createdUser = await this.userRepository
      .save(userAggregate)
      .catch((err) => {
        throw new DomainError(err, 'User is not valid');
      });
    return createdUser;
  }
}
