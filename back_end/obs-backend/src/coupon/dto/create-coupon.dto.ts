// src/coupon/dto/create-coupon.dto.ts
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCouponDto {
  @IsInt()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsDateString()
  validDate?: string;

  @IsPositive()
  discount: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  description: string;

  @IsUUID('4')
  memberID: string;
}
