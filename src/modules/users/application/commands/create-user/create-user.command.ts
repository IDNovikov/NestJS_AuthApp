import { CreateUserDTO } from '../dto/create-user.dto';

export class CreateUserCommand {
  constructor(public readonly dto: CreateUserDTO) {}
}
