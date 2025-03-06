import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Twilio from 'twilio';

@Injectable()
export class TwilioService {
  private twilioClient: Twilio.Twilio;

  constructor(private configService: ConfigService) {
    this.twilioClient = Twilio(
      this.configService.get<string>('TWILIO_ACCOUNT_SID'),
      this.configService.get<string>('TWILIO_AUTH_TOKEN'),
    );
  }

  async sendVerificationCode(phoneNumber: string, code: string): Promise<void> {
    await this.twilioClient.messages.create({
      body: `Your verification code is: ${code}`,
      from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
      to: phoneNumber,
    });
  }
}
