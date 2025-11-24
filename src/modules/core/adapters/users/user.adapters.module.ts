import { AuthUserReaderLocal } from '@/modules/users/adapters/authUser-reader.adapter';
import { AuthUserWriterLocal } from '@/modules/users/adapters/authUser-writer.adapter';
import { UserModule } from '@/modules/users/users.module';
import { Module } from '@nestjs/common';
import { AuthUserReaderPort } from './readers/authUser-reader.port';
import { AuthUserWriterPort } from './writer/authUser-writer.port';

@Module({
  imports: [UserModule],
  providers: [
    AuthUserReaderLocal,
    AuthUserWriterLocal,
    { provide: AuthUserReaderPort, useExisting: AuthUserReaderLocal },
    { provide: AuthUserWriterPort, useExisting: AuthUserWriterLocal },
  ],
  exports: [AuthUserReaderPort, AuthUserWriterPort],
})
export class UsersAdaptersModule {}
