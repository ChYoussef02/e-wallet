import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Wallet } from '../../wallet/entity/wallet.entity';

@Entity("transaction")
export class Transaction {
  @PrimaryGeneratedColumn()
    id: number;

    @Column()
    senderWalletId: number;

    @Column()
    receiverWalletId: number;

    @Column({ nullable: true })
    receiverEmail: string;

    @Column('decimal')
    amount: number;

    @Column({ default: 'PENDING' }) // SUCCESS or FAILED
    status: string;

    @Column()
    category: string; // 'deposit', 'transfer', etc.


    @Column()
    date : Date

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions, { onDelete: 'CASCADE' })
  wallet: Wallet;
}
