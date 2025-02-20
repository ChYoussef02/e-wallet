import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { TransactionDto } from './dto/transaction.dto';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('create/:userId')
  async createWallet(@Param('userId') userId: string) {
    return this.walletService.createWallet(userId);
  }

  @Get('balance/:userId')
  async getBalance(@Param('userId') userId: string) {
    return this.walletService.getBalance(userId);
  }

  @Post('send')
  async sendMoney(@Body() transactionDto: TransactionDto) {
    return this.walletService.sendMoney(transactionDto);
  }
}
