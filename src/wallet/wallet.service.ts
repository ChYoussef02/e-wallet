import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Wallet } from './entity/wallet.entity';
import { User } from 'src/user/entities/user.entities';
import { Transaction } from './dto/transaction.entities';
import { NotificationGateway } from '../notification/notificationGateway';
import { Notification } from '../notification/entity/notification.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateBalanceDto } from './dto/update-balance.dto';
import { SendMoneyDto } from './dto/send-money.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';


@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly notificationGateway: NotificationGateway,
    private readonly dataSource: DataSource

  ) {}

  async createWallet(user)  : Promise<Wallet> {
    const wallet = this.walletRepository.create({ user});
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

  async updateBalance(
    userId: number,
    amount:number,
  ): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    wallet.balance += amount;
   return  this.walletRepository.save(wallet);

  }

  async sendMoney( sendMoneyDto: SendMoneyDto): Promise<boolean> {
    const { userId, amount, recipientIdentifier } = sendMoneyDto;

    if (!recipientIdentifier || !amount ) {
      throw new BadRequestException('Recipient identifier and amount are required');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const senderWallet = await queryRunner.manager.findOne(Wallet, {
        where: { user: { id: userId } },
        relations: ['user'],
      });

      if (!senderWallet) {
        throw new NotFoundException('Sender wallet not found');
      }

      if (
        (recipientIdentifier.includes('@') && senderWallet.user.email === recipientIdentifier) ||
        (!recipientIdentifier.includes('@') && senderWallet.user.phoneNumber === recipientIdentifier)
      ) {
        throw new BadRequestException('You cannot send money to yourself');
      }

      let receiverWallet: Wallet;
      const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(recipientIdentifier);
      const isPhoneNumber = /^[0-9\+\-\(\)\s]*$/.test(recipientIdentifier);

      if (isEmail) {
        receiverWallet = await queryRunner.manager.findOne(Wallet, {
          where: { user: { email: recipientIdentifier } },
          relations: ['user'],
        });
      } else if (isPhoneNumber) {
        receiverWallet = await queryRunner.manager.findOne(Wallet, {
          where: { user: { phoneNumber: recipientIdentifier } },
          relations: ['user'],
        });
      }

      if (!receiverWallet) {
        throw new NotFoundException('Receiver wallet not found');
      }

      if (senderWallet.balance < amount) {
        throw new BadRequestException('Insufficient funds');
      }

      senderWallet.balance -= amount;
      receiverWallet.balance += amount;

      await queryRunner.manager.save(senderWallet);
      await queryRunner.manager.save(receiverWallet);

      // Create transaction records
      const senderTransaction = this.transactionRepository.create({
        owner: senderWallet.user.id,
        senderWalletId: senderWallet.walletId,
        receiverWalletId: receiverWallet.walletId,
        receiverEmail: receiverWallet.user.email,
        amount,
        status: 'SUCCESS',
        category: 'Transfer',
        date: new Date(),
      });

      const receiverTransaction = this.transactionRepository.create({
        senderWalletId: senderWallet.walletId,
        receiverWalletId: receiverWallet.walletId,
        receiverEmail: receiverWallet.user.email,
        amount,
        status: 'SUCCESS',
        category: 'Deposit',
        date: new Date(),
        owner: receiverWallet.user.id,
      });

      await queryRunner.manager.save([senderTransaction, receiverTransaction]);

      // Create and send notification
      const notification = this.notificationRepository.create({
        receiver: receiverWallet.user,
        message: `You received $${amount} from ${senderWallet.user.email || senderWallet.user.phoneNumber}`,
        isRead: false,
        createdAt: new Date(),
      });

      await queryRunner.manager.save(notification);

      this.notificationGateway.notifyUser(
        receiverWallet.user.id,
        `You received $${amount} from ${senderWallet.user.email || senderWallet.user.phoneNumber}`
      );

      // Commit the transaction (all operations succeed)
      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      // Rollback in case of failure
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release queryRunner
      await queryRunner.release();
    }
  }


  async getTransactionsByUser(
    userId: number,
    skip: number,
    limit: number,
  ): Promise<TransactionResponseDto> {
    const [transactions, totalTransactions] = await this.transactionRepository.findAndCount({
      where: { owner: userId },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalTransactions / limit);

    return {
      transactions,
      totalPages,
      currentPage: Math.ceil(skip / limit) + 1,
    };
  }


  async getRecentTransactions(userId: number): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { owner: userId },
      order: { date: "DESC" }, // Sort by newest first
      take: 4, // Limit to 3 transactions
    });
  }

}
