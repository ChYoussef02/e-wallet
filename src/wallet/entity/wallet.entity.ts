import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { Transaction } from "../dto/transaction.entities";
import { User } from 'src/user/entities/user.entities';

@Entity("wallet")
export class Wallet {
  @PrimaryGeneratedColumn()
  walletId: number;

  @Column({ type: 'decimal', default: 0 ,transformer: {
    to: (value: number) => value.toString(),
    from: (value: string) => Number(value)  }})
  balance: number;

  @Column({ nullable: false })
  userId: number;

  @OneToOne(() => User, (user) => user.wallet)
  @JoinColumn({ name: 'userId' })
  user: User;



  @OneToMany(() => Transaction, (transaction) => transaction.wallet)
  transactions: Transaction[];
}
