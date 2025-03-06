import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Wallet } from '../entity/wallet.entity';

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

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    date: Date;

    @Column({ nullable: true })
    owner: number;

    @Column({ nullable: true })
    note?: string;


  @ManyToOne(() => Wallet, (wallet) => wallet.transactions, { onDelete: 'CASCADE' })
  wallet: Wallet;

}
