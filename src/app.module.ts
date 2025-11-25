import { Module } from '@nestjs/common';
import { CoreModule } from './modules/core/core.module';
import { UserModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { RedisModule } from './modules/core/redis/redis.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { APP_GUARD } from '@nestjs/core';
import { AuthUserReaderPort } from './modules/core/adapters/users/readers/authUser-reader.port';
import { AuthUserReaderLocal } from './modules/users/adapters/authUser-reader.adapter';
import { AuthUserWriterPort } from './modules/core/adapters/users/writer/authUser-writer.port';
import { AuthUserWriterLocal } from './modules/users/adapters/authUser-writer.adapter';
import { UsersAdaptersModule } from './modules/core/adapters/users/user.adapters.module';
import { DesksModule } from './modules/desks/desks.module';

@Module({
  imports: [
    //TODO  Joi
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),
    ThrottlerModule.forRoot([{ ttl: 60, limit: 100 }]),
    RedisModule,
    CoreModule,
    DesksModule,
    UserModule,
    UsersAdaptersModule,
    AuthModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: true,
    }),
  ],
  providers: [
    {
      provide: AuthUserReaderPort,
      useExisting: AuthUserReaderLocal,
    },
    {
      provide: AuthUserWriterPort,
      useExisting: AuthUserWriterLocal,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
