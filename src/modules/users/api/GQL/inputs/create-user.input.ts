import { Field, InputType } from '@nestjs/graphql';
import { CreateUserDto } from '../../dto/create-user.dto';

@InputType()
export class CreateUserInput implements CreateUserDto {
  @Field()
  email: string;
  @Field()
  password: string;
  @Field()
  userName: string;
}
