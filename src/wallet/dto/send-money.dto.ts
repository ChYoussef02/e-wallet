import { IsNotEmpty, IsNumber, IsPositive, IsString, Matches } from 'class-validator';

export class SendMoneyDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @IsString()
  note: string;

  @IsString()
  @IsNotEmpty()
  @Matches(
    /^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|[0-9\+\-\(\)\s]*)$/,
    { message: 'Recipient identifier must be a valid email or phone number' }
  )
  recipientIdentifier: string;
}
