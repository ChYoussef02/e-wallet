import { User } from 'src/user/entities/user.entities';
import { Column, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

export class CreateWalletDto {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({ type: 'decimal', default: 0 })
  balance: number;
}
