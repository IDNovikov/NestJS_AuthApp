import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HashService } from './hash.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: HashService,
      useFactory: (config: ConfigService) =>
        new HashService({
          rounds: Number(config.get('BCRYPT_SALT_ROUNDS', 10)),
          pepper: config.get<string>('PASSWORD_PEPPER', ''),
        }),
      inject: [ConfigService],
    },
  ],
  exports: [HashService],
})
export class AuthModule {}
