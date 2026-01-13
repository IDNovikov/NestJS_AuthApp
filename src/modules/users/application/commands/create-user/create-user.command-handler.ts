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

    const existingUser = await this.userRepository.findFirstByEmailOrName(
      userAggregate.userName,
      userAggregate.email,
    );

    const createdUser = await this.userRepository
      .create(userAggregate)
      .catch((err) => {
        throw new DomainError(err, 'User is not valid');
      });
    return createdUser;
  }
}

// async createUser(dto: ICreateUserDto): Promise<User> {
//     const { email, password, userName } = dto;
//
//     if (exist?.email === email) {
//       throw new ConflictException({ message: 'Email already registered' });
//     } else if (exist?.userName === userName) {
//       throw new ConflictException({ message: 'UserName already registered' });
//     }

//     const user = await this.prisma.user.create({
//       data: {
//         userName: userName,
//         email: email,
//         password: password,
//         role: 'USER',
//       },
//     });

//     await this.redis.set(`user:${user.id}`, UserMapper.safeUser(user));
//     return user;
//   }
