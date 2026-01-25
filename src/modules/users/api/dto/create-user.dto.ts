import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

@InputType()
export class CreateUserDto {
  @Field() @ApiProperty() @IsEmail() email!: string;
   @Field() @ApiProperty({ minLength: 6 }) @IsNotEmpty() @MinLength(6) password!: string;
   @Field() @ApiProperty({ minLength: 3 }) @IsNotEmpty() @MinLength(3) userName!: string;
}

export type ICreateUserDto = InstanceType<typeof CreateUserDto>;
