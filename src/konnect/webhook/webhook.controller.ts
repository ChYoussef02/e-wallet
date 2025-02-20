import { Controller, Get, HttpException, HttpStatus, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { PaymentService } from '../payment/payment.service';
import { WalletService } from 'src/wallet/wallet.service';

@Controller()
export class WebhookController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly walletService: WalletService,
  ) {}
  @Get('notification_payment')
  async handleWebhook(
    @Query('payment_ref') paymentRef: string,
    @Res() res: Response,
  ) {
    try {

      console.log('Webhook received with payment_ref:', paymentRef);

      // Process payment status update here
      // For example, you might want to verify the payment status using the payment_ref
      // const paymentStatus = await this.paymentService.verifyPayment(paymentRef);
      console.log(`Payment Reference: ${paymentRef}`);
      // 1️⃣ Verify Payment Status from Konnect API
      const paymentDetails = await this.paymentService.getPaymentDetails(paymentRef);
      console.log('Payment details:', paymentDetails);

      if (paymentDetails?.payment.status !=='completed') {
        throw new HttpException('Payment not completed', HttpStatus.BAD_REQUEST);
      }

      // 2️⃣ Extract User Info from Payment Response
      const { orderId, amount, email } = paymentDetails; console.log(paymentDetails)

      // 3️⃣ Update User Wallet Balance in Your Database
      await this.walletService.updateBalance(orderId, amount);

      console.log(`✅ Wallet updated for user ${email} with amount ${amount}`);

      // Respond to Konnect that webhook was received successfully
      res.status(200).send('Webhook processed');
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).send('Webhook processing failed');
    }
  }
}
