import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
import {
  PaymentDto,
  PaymentResponseDto,
} from './dto/payment.dto';
import { ConfigService } from '@nestjs/config';
import { WalletService } from 'src/wallet/wallet.service';

dotenv.config();

@Injectable()
export class PaymentService {
  private readonly konnectBaseUrl ='https://api.sandbox.konnect.network/api/v2/payments';
  private readonly apiKey = process.env.KONNECT_API_KEY;
  constructor(private readonly config:ConfigService , private readonly walletService : WalletService,){}
  async initiatePayment(paymentDto: PaymentDto): Promise<PaymentResponseDto> {
    try {
      console.log('Sending paymentDto:', JSON.stringify(paymentDto, null, 2));
      const response = await axios.post(
        `${this.konnectBaseUrl}/init-payment`,
        paymentDto,
        { headers: { 'x-api-key': this.apiKey } },
      );
      const { orderId, amount, email } = paymentDto;

      // 3️⃣ Update User Wallet Balance in Your Database
      const parsedOrderId = parseInt(orderId, 10);
      console.log("start updating wallet ... ");

      await this.walletService.updateBalance(parsedOrderId, amount);

      console.log(`✅ Wallet updated for user ${email} with amount ${amount}`);
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
