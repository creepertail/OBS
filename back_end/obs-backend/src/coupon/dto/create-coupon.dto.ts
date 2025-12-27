// src/coupon/dto/create-coupon.dto.ts
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCouponDto {
  @IsInt()
  @IsPositive()
  quantity: number;

  @IsOptional()
  @IsDateString()
  validDate?: string;

  @IsPositive()
  discount: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  description: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  redemptionCode: string;

  @IsUUID('4')
  memberID: string;
}
