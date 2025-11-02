import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
  private readonly logger = new Logger(MailService.name);
  constructor(private readonly config: ConfigService) {
    const port = Number(this.config.get('SMTP_PORT')) || 465;
    const secure = port === 465;
    const host = this.config.get('SMTP_HOST');
    const user = this.config.get('EMAIL_USER');
    const pass = this.config.get('EMAIL_PASS');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }, // можно убрать после отладки
    });
  }

  async sendMail(to: string, subject: string, text: string, html?: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"AfishaVed" <${this.config.get('EMAIL_USER')}>`,
        to,
        subject,
        text,
        html: html ?? text,
      });
    } catch (error) {
      this.logger.error(error.stack);
      throw new ServiceUnavailableException('Error with mailer');
    }
  }

  async sendVerificationMail(to: string, code: string) {
    const html = `
      <div style="font-family:sans-serif;padding:20px">
        <h2>Подтверждение почты</h2>
        <p>Ваш код: <b>${code}</b></p>
        <p>Он действителен 10 минут.</p>
      </div>`;

    await this.sendMail(to, 'Код подтверждения', `Ваш код: ${code}`, html);
  }

  async sendTempPass(to: string, tempPass: string) {
    const html = `
      <div style="font-family:sans-serif;padding:20px">
        <h2>Временный пароль</h2>
        <p>Пароль: <b>${tempPass}</b></p>
        <p>После входа, пожалуйста, как можно быстрее обновите пароль</p>
      </div>`;

    await this.sendMail(to, 'Временный пароль', `Пароль: ${tempPass}`, html);
  }
}
