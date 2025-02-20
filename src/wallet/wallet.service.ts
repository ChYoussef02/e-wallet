import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entity/wallet.entity';
import { TransactionDto } from './dto/transaction.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
  ) {}

  async createWallet(userId: number): Promise<Wallet> {
    const wallet = this.walletRepository.create({ userId, balance: 0 });
    return this.walletRepository.save(wallet);
  }

  async getBalance(userId: number): Promise<number> {
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    return wallet.balance;
  }

  async updateBalance(userId: number, amount: number): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    wallet.balance += amount;
    return this.walletRepository.save(wallet);
  }

  async sendMoney(transactionDto: TransactionDto): Promise<string> {
    const { senderId, receiverId, amount } = transactionDto;

    if (senderId === receiverId) {
      throw new BadRequestException('You cannot send money to yourself');
    }

   /* const senderWallet = await this.walletRepository.findOne({
      where: { user: { id: senderId } },
      relations: ['user'],
    });

    const receiverWallet = await this.walletRepository.findOne({
      where: { user: { id: receiverId } },
      relations: ['user'],
    });

    if (!senderWallet || !receiverWallet) {
      throw new NotFoundException('Sender or receiver wallet not found');
    }

    if (senderWallet.balance < amount) {
      throw new BadRequestException('Insufficient funds');
    }

    senderWallet.balance -= amount;
    receiverWallet.balance += amount;

    await this.walletRepository.save(senderWallet);
    await this.walletRepository.save(receiverWallet);
    */
    return 'Transaction successful';
  }
}
