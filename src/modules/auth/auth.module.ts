import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HashService } from './hash.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../users/users.module';

@Global()
@Module({
  imports: [
    ConfigModule,
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
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
