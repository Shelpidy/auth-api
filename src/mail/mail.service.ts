import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { emailConfig } from '../config/email.config';

@Injectable()
export class MailService {
  private transporter = createTransport(emailConfig);

  async sendVerificationEmail(email: string, otp: string) {
    await this.transporter.sendMail({
      to: email,
      from: process.env.SMTP_USER,
      subject: 'Verify Your Email',
      html: this.getEmailTemplate('Verify Your Email', otp),
    });
  }

  async sendPasswordResetEmail(email: string, otp: string) {
    await this.transporter.sendMail({
      to: email,
      from: process.env.SMTP_USER,
      subject: 'Password Reset OTP',
      html: this.getEmailTemplate('Password Reset OTP', otp),
    });
  }

  private getEmailTemplate(title: string, otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          // ...existing email template styles...
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-header">
            <h1>${title}</h1>
          </div>
          <div class="email-body">
            <div class="otp-container">
              <div class="otp-code">${otp}</div>
              <p class="expiry-text">This code will expire in 10 minutes</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
