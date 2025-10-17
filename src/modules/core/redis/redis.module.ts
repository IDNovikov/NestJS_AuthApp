import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: RedisService,
      useFactory: (config: ConfigService) =>
        new RedisService({
          host: config.get('REDIS_HOST', '127.0.0.1'),
          port: Number(config.get('REDIS_PORT', 6379)),
          password: config.get('REDIS_PASSWORD', undefined),
          db: Number(config.get('REDIS_DB', 0)),
        }),
      inject: [ConfigService],
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}
