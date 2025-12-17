// src/cart/dto/update-cart-item.dto.ts
import { IsInt, IsPositive } from 'class-validator';

export class UpdateCartItemDto {
  @IsInt()
  @IsPositive()
  amount: number;
}

