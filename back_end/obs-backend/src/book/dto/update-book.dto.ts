// src/book/dto/update-book.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { IsInt, IsOptional, Min } from 'class-validator';
import { CreateBookDto } from './create-book.dto';

export class UpdateBookDto extends PartialType(CreateBookDto) {
  // 覆蓋 inventoryQuantity 的驗證規則，允許 0（表示缺貨）
  @IsOptional()
  @IsInt()
  @Min(0, { message: 'InventoryQuantity must be greater than or equal to 0' })
  inventoryQuantity?: number;
}
