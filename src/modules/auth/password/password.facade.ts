import { Injectable } from '@nestjs/common';
import { PasswordService } from './password.service';
import { MailService } from '@/modules/mail/mail.service';
import { UsersService } from '@/modules/users/users.service';
import { ChangePassDto } from './dto/changePass.dto';

@Injectable()
export class PasswordFacade {
  constructor(
    private readonly passwordService: PasswordService,
    private mail: MailService,
    private users: UsersService,
  ) {}

  async changePassword(userId: number, dto: ChangePassDto) {
    const { oldPassword, newPassword } = dto;
    await this.passwordService.checkPasswords(userId, oldPassword, newPassword);
    await this.passwordService.updateUserPassword(userId, newPassword);
    //TO DO: ADD REVOKE
    return { message: 'Password successfully changed.' };
  }

  async getTempPass(email: string) {
    await this.passwordService.isPasswordSend(email);
    const { id } = await this.users.getUserByEmail(email);
    const tempPass = this.passwordService.generateNewPassword();
    await this.passwordService.updateUserPassword(id, tempPass);
    await this.mail.sendTempPass(email, tempPass);
    return { message: 'Password successfully changed. Check your email' };
  }
}
