// src/order/dto/update-order.dto.ts
// src/order/dto/update-order.dto.ts
import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class UpdateOrderDto {
  @IsString()
  @MaxLength(100)
  @IsOptional()
  shippingAddress?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  paymentMethod?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  totalPrice?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  state?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  totalAmount?: number;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsUUID()
  @IsOptional()
  merchantId?: string;

  @IsUUID()
  @IsOptional()
  couponId?: string;
}
