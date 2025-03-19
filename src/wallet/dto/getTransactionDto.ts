import { IsInt, Min } from "class-validator";

export class GetTransactionsDto {
  @IsInt()
  @Min(1, { message: "User ID must be a positive number." })
  userId: number;

  @IsInt()
  @Min(0, { message: "Skip value must be zero or a positive number." })
  skip: number;

  @IsInt()
  @Min(1, { message: "Limit must be at least 1." })
  limit: number;
}
