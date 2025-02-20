import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WalletModule } from 'src/wallet/wallet.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  controllers: [WebhookController],
  imports: [PaymentModule, WalletModule],


})
export class WebhookModule {}
