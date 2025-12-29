// src/order/dto/checkout-order.dto.ts
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CheckoutOrderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  shippingAddress: string;

  @IsInt()
  @Min(0)
  paymentMethod: number;

  @IsUUID()
  merchantId: string;

  @IsUUID()
  @IsOptional()
  claimId?: string;
}
