// src/order/dto/create-order.dto.ts
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  shippingAddress: string;

  @IsInt()
  @Min(0)
  paymentMethod: number;

  @IsInt()
  @Min(0)
  totalPrice: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  state?: number;

  @IsInt()
  @Min(1)
  totalQuantity: number;

  @IsUUID()
  @IsOptional()
  couponId?: string;
}
