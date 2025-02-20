import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Get,
  Param,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import {  PaymentDto, PaymentResponseDto } from './dto/payment.dto';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}
  @Post('initiate')
  async initiatePayment(
    @Body() body: { firstName: string; lastName: string; email: string; phoneNumber: string; amount: number }
  ): Promise<PaymentResponseDto> {
    try {
      console.log('Received user data:', JSON.stringify(body, null, 2));

      const paymentPayload = {
        receiverWalletId: process.env.RECEIVER_WALLET_ID,
        token: 'TND',
        amount: body.amount,
        type: 'immediate',
        description: 'payment description',
        acceptedPaymentMethods: ['wallet', 'bank_card', 'e-DINAR'],
        lifespan: 10,
        checkoutForm: true,
        addPaymentFeesToAmount: true,
        firstName: body.firstName,
        lastName: body.lastName,
        phoneNumber: body.phoneNumber,
        email: body.email,
        orderId: '1234657',
        webhook: process.env.WEBHOOK_URL,
        silentWebhook: true,
        successUrl: process.env.SUCCESS_URL,
        failUrl: process.env.FAIL_URL,
        theme: 'dark',
      };

      return await this.paymentService.initiatePayment(paymentPayload);
    } catch (err) {
      throw new HttpException(
        err.response?.data || 'Payment initiation failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':paymentId')
  async getPaymentDetails(@Param('paymentId') paymentId: string): Promise<any> {
    try {

      const paymentDetails = await this.paymentService.getPaymentDetails(paymentId);

    console.log(paymentDetails);

    return paymentDetails;


    } catch (error) {
      console.log('Error:', error);
      const errResponse = error?.response?.data || 'Failed to retrieve payment details';

      throw new HttpException(errResponse, HttpStatus.BAD_REQUEST);
    }
  }
}
