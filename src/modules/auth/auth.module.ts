import { forwardRef, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HashService } from './hash.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { JwtStrategy } from './jwt.strategy';
import { RefreshJwtStrategy } from './refreshJwt.stratagy';
import { RedisModule } from '../core/redis/redis.module';
import { AuthController } from './auth/auth.controller';
import { AdminController } from './admin/admin.controller';
import { PasswordController } from './password/password.controller';
import { RegistrationController } from './registration/registration.controller';
import { SessionsController } from './session/session.controller';
import { AuthService } from './auth/auth.service';
import { PasswordService } from './password/password.service';
import { RegistrationService } from './registration/registration.service';
import { SessionsService } from './session/session.service';
import { AuthFacade } from './auth/auth.facade';
import { RegistrationFacade } from './registration/registration.facade';
import { AdminFacade } from './admin/admin.facade';
import { PasswordFacade } from './password/password.facade';
import { SessionFacade } from './session/session.facade';

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
  controllers: [
    AuthController,
    AdminController,
    PasswordController,
    RegistrationController,
    SessionsController,
  ],
  providers: [
    AuthService,
    PasswordService,
    RegistrationService,
    SessionsService,
    JwtStrategy,
    RefreshJwtStrategy,
    HashService,
    JwtModule,
    PassportModule,
    AuthFacade,
    AdminFacade,
    RegistrationFacade,
    PasswordFacade,
    SessionFacade,
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
  exports: [
    HashService,
    JwtModule,
    PassportModule,
    AuthFacade,
    AdminFacade,
    RegistrationFacade,
    PasswordFacade,
    SessionFacade,
  ],
})
export class AuthModule {}
