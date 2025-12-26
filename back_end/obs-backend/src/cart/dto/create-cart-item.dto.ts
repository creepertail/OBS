// src/cart/dto/create-cart-item.dto.ts
import { IsInt, IsPositive, IsUUID } from 'class-validator';

export class CreateCartItemDto {
  @IsUUID()
  bookID: string;

  @IsInt()
  @IsPositive()
  quantity: number;
}
