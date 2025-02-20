import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
import {
  PaymentDto,
  PaymentResponseDto,
} from './dto/payment.dto';
import { ConfigService } from '@nestjs/config';

dotenv.config();

@Injectable()
export class PaymentService {
  private readonly konnectBaseUrl =
    'https://api.sandbox.konnect.network/api/v2/payments';
  private readonly apiKey = process.env.KONNECT_API_KEY;
  constructor(private readonly config:ConfigService){}
  async initiatePayment(paymentDto: PaymentDto): Promise<PaymentResponseDto> {
    try {
      console.log('Sending paymentDto:', JSON.stringify(paymentDto, null, 2));
      const response = await axios.post(
        `${this.konnectBaseUrl}/init-payment`,
        paymentDto,
        { headers: { 'x-api-key': this.apiKey } },
      );
      console.log('Response data:', response.data);
      return response.data as PaymentResponseDto;
    } catch (error) {
      console.log('Error response:', error.response?.data);
      const errResponse = error?.response?.data || 'Failed to retrieve payment details';

      throw new HttpException(errResponse, HttpStatus.BAD_REQUEST);
    }
  }

  async getPaymentDetails(paymentId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.konnectBaseUrl}/${paymentId}`, {
        headers: { 'x-api-key': this.apiKey },
      });
      return response.data;
    } catch (error) {

      console.log('Error response:', error.response?.data);
      const errResponse = error?.response?.data || 'Failed to retrieve payment details';

      throw new HttpException(errResponse, HttpStatus.BAD_REQUEST);
    }
  }
}
