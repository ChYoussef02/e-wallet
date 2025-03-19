import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class AuthDto {
  @IsString()
  @IsOptional()
  fullName?:string;
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  balance?:number;


  @IsString()
  @IsOptional()
  password?: string;

  }