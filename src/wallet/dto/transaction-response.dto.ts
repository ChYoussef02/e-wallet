// src/wallet/dto/transaction-response.dto.ts
import { Transaction } from './transaction.entities';

export class TransactionResponseDto {
  transactions: Transaction[];
  totalPages: number;
  currentPage: number;
}
