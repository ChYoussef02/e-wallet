import { Notification } from 'src/notification/entity/notification.entity';
import { Wallet } from 'src/wallet/entity/wallet.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity("user")
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  fullName:string;

  @Column({ unique: true })
  email: string;

  @Column({   nullable:true })
  phoneNumber: string;

  @Column()
  hash: string;

  @Column({ nullable: true })
  verificationCode: string;

  @Column({ nullable: true })
  smsCode: string;

  @Column({ type: 'timestamp', nullable: true })
  smsCodeExpires: Date;

  @Column({ nullable: true })
  verificationId: string | null;

  @OneToOne(() => Wallet, (wallet) => wallet.user, { cascade: true })
  wallet: Wallet;

  @OneToMany(() => Notification, (notification) => notification.receiver)
  notifications: Notification[];
}
