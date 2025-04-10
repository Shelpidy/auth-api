import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import { nanoid } from 'nanoid';
import axios from 'axios';

@Injectable()
export class SmsService {

  private readonly defaultSmsSettings = {
    sms_authorization_endpoint: process.env.SMS_API_URL,
    sms_authorization_key: process.env.SMS_API_KEY,
    sms_authorization_sender: process.env.SMS_SENDER,
    sms_authorization_api_key: process.env.SMS_API_KEY,
    is_default: true
  };

  constructor(
    @Inject('DATABASE_CONNECTION')
    private db: NodePgDatabase<typeof schema>,
  ) {}

  private async logSmsSend(params: {
    tenant_id: string;
    sender_number: string;
    recipient_number: string;
    sms_message_sent: any;
    send_user_id?: string;
    recipent_user_id?: string;
    change_by_login_ip?: string;
    created_by: string;
  }) {
    await this.db.insert(schema.sms_logs).values({
      sms_log_id: `tpe${nanoid(19)}`,
      tenant_id: params.tenant_id,
      sender_number: params.sender_number,
      recipient_number: params.recipient_number,
      sms_message_sent: params.sms_message_sent,
      send_user_id: params.send_user_id,
      recipent_user_id: params.recipent_user_id,
      change_by_login_ip: params.change_by_login_ip,
      created_by: params.created_by,
      modified_by: params.created_by,
    });
  }

  async sendOtp(phone: string, otp: string, smsSettings: any = this.defaultSmsSettings, context?: {
    tenant_id: string;
    sender_name: string;
    send_user_id?: string;
    recipent_user_id?: string;
    change_by_login_ip?: string;
  }) {
    const message = `Your verification code is: ${otp}`;
    
    const messageData = {
      numbers: phone,
      sender: smsSettings.sms_authorization_sender,
      message: message
    };

    // Send SMS using settings
    await axios.post(smsSettings.sms_authorization_endpoint, messageData, {
      headers: {
        'Authorization': `Bearer ${smsSettings.sms_authorization_api_key}`
      }
    });

    if(context){
      // Log the SMS
      await this.logSmsSend({
        tenant_id: context.tenant_id,
        sender_number: smsSettings.sms_authorization_sender,
        recipient_number: phone,
        sms_message_sent: messageData,
        send_user_id: context.send_user_id,
        recipent_user_id: context.recipent_user_id,
        change_by_login_ip: context.change_by_login_ip,
        created_by: context.sender_name,
      });
    }

  }
  async sendSMS(phones: string[], data: {title:string,message:string}, smsSettings: any = this.defaultSmsSettings, context?: {
    tenant_id: string;
    sender_name: string;
    send_user_id?: string;
    recipent_user_id?: string;
    change_by_login_ip?: string;
  }) {
  
    const messageData = {
      numbers: phones.join(','),
      sender: smsSettings.sms_authorization_sender,
      message: data.message
    };

    // Send SMS using settings
    await axios.post(smsSettings.sms_authorization_endpoint, messageData, {
      headers: {
        'Authorization': `Bearer ${smsSettings.sms_authorization_api_key}`
      }
    });

    if(context){
      // Log the SMS
      await this.logSmsSend({
        tenant_id: context.tenant_id,
        sender_number: smsSettings.sms_authorization_sender,
        recipient_number: phones.join(','),
        sms_message_sent: messageData,
        send_user_id: context.send_user_id,
        recipent_user_id: context.recipent_user_id,
        change_by_login_ip: context.change_by_login_ip,
        created_by: context.sender_name,
      });
    }

  }
}
