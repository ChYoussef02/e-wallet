import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';

export class TransactionDto {
  @IsString()
  @IsNotEmpty()
  senderId: string;

  @IsString()
  @IsNotEmpty()
  receiverId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;
}
