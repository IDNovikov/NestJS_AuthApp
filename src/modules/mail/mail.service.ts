import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
  constructor(private readonly config: ConfigService) {
    const transportOptions: SMTPTransport.Options = {
      host: this.config.get<string>('SMTP_HOST') || 'smtp.yandex.ru',
      port: Number(this.config.get<string>('SMTP_PORT')) || 465,
      secure: this.config.get<boolean>('SMTP_SECURE') ?? true,
      auth: {
        user: this.config.get<string>('EMAIL_USER'),
        pass: this.config.get<string>('EMAIL_PASS'),
      },
    };

    this.transporter = nodemailer.createTransport(transportOptions);
  }

  async sendMail(to: string, subject: string, text: string, html?: string) {
    await this.transporter.sendMail({
      from: `"AfishaVed" <${this.config.get('SMTP_USER')}>`,
      to,
      subject,
      text,
      html: html ?? text,
    });
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
}
