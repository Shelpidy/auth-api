import { Injectable, Inject } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import { nanoid } from 'nanoid';

@Injectable()
export class MailService {

  private readonly defaultEmailSettings = {
    email_smtp_server: process.env.SMTP_HOST,
    email_smtp_email: process.env.SMTP_FROM,
    email_smtp_username: process.env.SMTP_USER,
    email_smtp_password: process.env.SMTP_PASS,
    email_smtp_ssl_port: process.env.SMTP_PORT,
    email_smtp_tls_port: process.env.SMTP_PORT,
    email_smtp_is_ssl: false,
    email_smtp_is_tls: true,
    email_smtp_authentication: true,
    email_smtp_full_name: process.env.SMTP_FROM_NAME || 'System',
    is_default: true
  };

  constructor(
    @Inject('DATABASE_CONNECTION')
    private db: NodePgDatabase<typeof schema>,
  ) {}

  private async logEmailSend(params: {
    tenant_id: string;
    sender_email: string;
    recipient_email: string;
    email_message_sent: any;
    send_user_id?: string;
    recipent_user_id?: string;
    change_by_login_ip?: string;
    created_by: string;
  }) {
    await this.db.insert(schema.email_logs).values({
      email_log_id: `tpe${nanoid(19)}`,
      tenant_id: params.tenant_id,
      sender_email: params.sender_email,
      recipient_email: params.recipient_email,
      email_message_sent: params.email_message_sent,
      send_user_id: params.send_user_id,
      recipent_user_id: params.recipent_user_id,
      change_by_login_ip: params.change_by_login_ip,
      created_by: params.created_by,
      modified_by: params.created_by,
    });
  }

  async sendOtp(email: string, otp: string, emailSettings: any, context?: {
    tenant_id: string;
    sender_name: string;
    send_user_id?: string;
    recipent_user_id?: string;
    change_by_login_ip?: string;
  }) {
    const transporter = createTransport({
      host: emailSettings.email_smtp_server,
      port: parseInt(emailSettings.email_smtp_tls_port || emailSettings.email_smtp_ssl_port),
      secure: emailSettings.email_smtp_tls_port?false:true,
      auth: {
        user: emailSettings.email_smtp_username,
        pass: emailSettings.email_smtp_password
      }
    });

    const messageData = {
      from:  emailSettings.email_smtp_username,
      to: email,
      subject: 'Your verification code',
      html: this.getOtpTemplate('Verify Your Account', otp)
    };
  // console.log('messageData', messageData);
    await transporter.sendMail(messageData);

    if(context){
      // Log the email
      await this.logEmailSend({
        tenant_id: context.tenant_id,
        sender_email: emailSettings.email_smtp_email,
        recipient_email: email,
        email_message_sent: messageData,
        send_user_id: context.send_user_id,
        recipent_user_id: context.recipent_user_id,
        change_by_login_ip: context.change_by_login_ip,
        created_by: context.sender_name,
      });
    }

  }

  async sendVerificationEmail(email: string, otp: string, emailSettings: any, context: {
    tenant_id: string;
    sender_name: string;
    send_user_id?: string;
    recipent_user_id?: string;
    change_by_login_ip?: string;
  }) {
    return this.sendOtp(email, otp, emailSettings, context);
  }

  async sendPasswordResetEmail(email: string, otp: string, emailSettings: any, context: {
    tenant_id: string;
    sender_name: string;
    send_user_id?: string;
    recipent_user_id?: string;
    change_by_login_ip?: string;
  }) {
    return this.sendOtp(email, otp, emailSettings, context);
  }

  async sendWelcomeEmail(
    to: string, 
    data: { tenant_name: string; owner_name: string },
    settings: any,
    context: {
      tenant_id: string;
      sender_name: string;
      send_user_id?: string;
      recipent_user_id?: string;
      change_by_login_ip?: string;
    }
  ) {
    const subject = `Welcome to ${data.tenant_name}`;
    const html = `
      <h1>Welcome to ${data.tenant_name}!</h1>
      <p>Dear ${data.owner_name},</p>
      <p>Thank you for registering with us. Your tenant account has been successfully created.</p>
      <p>You can now start using our services.</p>
      <br/>
      <p>Best regards,</p>
      <p>The Team</p>
    `;

    return this.sendMail(to, subject, html, settings || this.defaultEmailSettings, context);
  }

  private async sendMail(to: string, subject: string, html: string, emailSettings: any, context: {
    tenant_id: string;
    sender_name: string;
    send_user_id?: string;
    recipent_user_id?: string;
    change_by_login_ip?: string;
  }) {
    const transporter = createTransport({
      host: emailSettings.email_smtp_server,
      port: emailSettings.email_smtp_ssl_port,
      secure: emailSettings.email_smtp_is_ssl,
      auth: {
        user: emailSettings.email_smtp_username,
        pass: emailSettings.email_smtp_password
      }
    });

    const messageData = {
      from: emailSettings.email_smtp_full_name,
      to,
      subject,
      html
    };

    await transporter.sendMail(messageData);

    // Log the email
    await this.logEmailSend({
      tenant_id: context.tenant_id,
      sender_email: emailSettings.email_smtp_email,
      recipient_email: to,
      email_message_sent: messageData,
      send_user_id: context.send_user_id,
      recipent_user_id: context.recipent_user_id,
      change_by_login_ip: context.change_by_login_ip,
      created_by: context.sender_name,
    });
  }

  private getOtpTemplate(title: string, otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            font-family: Arial, sans-serif;
          }
          .otp-container {
            text-align: center;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 5px;
            margin: 20px 0;
          }
          .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #007bff;
            letter-spacing: 5px;
            margin: 20px 0;
          }
          .expiry-text {
            color: #6c757d;
            font-size: 14px;
          }
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
