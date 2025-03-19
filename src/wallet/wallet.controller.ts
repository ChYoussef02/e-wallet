import { Controller, Post, Get, Body, Param, ParseIntPipe, UseGuards, Req, Query, ValidationPipe, UsePipes } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './dto/transaction.entities';
import { Repository } from 'typeorm';
import { SendMoneyDto } from './dto/send-money.dto';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService ,
      @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
  ) {}



  @Get('balance/:userId')
  async getBalance(@Param('userId', ParseIntPipe) userId: number) {
    return this.walletService.getBalance(userId);
  }

  @Post('send')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async sendMoney(@Body() sendMoneyDto: SendMoneyDto) {
    return this.walletService.sendMoney(
     sendMoneyDto
    );
  }


  @Get('transactions')
  async getTransactions(
    @Query('userId') userId: number,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 5,

  ) {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;
    return this.walletService.getTransactionsByUser(userId, skip, limit);
  }


  @Get('transactions/home')
async getRecentTransactions(@Query('userId') userId: number) {
  return this.walletService.getRecentTransactions(userId);
}

}
