import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { Transaction } from "../dto/transaction.entities";
import { User } from 'src/user/entities/user.entities';

@Entity("wallet")
export class Wallet {
  @PrimaryGeneratedColumn()
  walletId: number;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, transformer: {
    to: (value: number) => value,  // Stores as is
    from: (value: string) => parseFloat(value)  // Converts from string to number
}})
  balance: number;

  @Column({ nullable: false })
  userId: number;

  @OneToOne(() => User, (user) => user.wallet)
  @JoinColumn({ name: 'userId' })
  user: User;



  @OneToMany(() => Transaction, (transaction) => transaction.wallet)
  transactions: Transaction[];
}
