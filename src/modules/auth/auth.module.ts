import { forwardRef, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HashService } from './hash.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { RefreshJwtStrategy } from './refreshJwt.stratagy';
import { RedisModule } from '../core/redis/redis.module';

@Global()
@Module({
  imports: [
    ConfigModule,
    RedisModule,
    forwardRef(() => UserModule),
    MailModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshJwtStrategy,
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
  exports: [HashService, JwtModule, PassportModule],
})
export class AuthModule {}
