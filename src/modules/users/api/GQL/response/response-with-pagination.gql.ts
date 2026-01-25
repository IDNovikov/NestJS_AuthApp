import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Type } from '@nestjs/common';
import { UserGqlEntity } from '../models/user-gql.entity';

export interface IPaginated<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export function Paginated<T>(classRef: Type<T>): Type<IPaginated<T>> {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedType implements IPaginated<T> {
    @Field(() => [classRef], { nullable: false })
    data!: T[];

    @Field(() => Int)
    total!: number;

    @Field(() => Int)
    limit!: number;

    @Field(() => Int)
    offset!: number;
  }

  return PaginatedType as Type<IPaginated<T>>;
}

@ObjectType()
export class PaginatedUsers extends Paginated(UserGqlEntity) {}
