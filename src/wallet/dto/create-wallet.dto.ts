// src/wallet/dto/create-wallet.dto.ts
import { User } from 'src/user/entities/user.entities';

export class CreateWalletDto {
  user: User;
  balance: number;
}
