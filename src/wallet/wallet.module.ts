import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entity/wallet.entity';
import { UserModule } from '../user/user.module';
import { Transaction } from 'src/wallet/dto/transaction.entities';
import { NotificationGateway } from '../notification/notificationGateway';
import { Notification } from 'src/notification/entity/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, Transaction,Notification]), UserModule],
  controllers: [WalletController],
  providers: [WalletService ,NotificationGateway],
  exports: [WalletService],
})
export class WalletModule {}
