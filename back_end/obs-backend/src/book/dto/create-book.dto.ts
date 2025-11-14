// src/book/dto/create-book.dto.ts
import { IsString, IsInt, IsOptional, Min, Length, IsArray, ValidateNested, IsBoolean, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookImageDto {
  @IsString()
  imageUrl: string;

  @IsInt()
  @Min(0)
  displayOrder: number;

  @IsBoolean()
  isCover: boolean;
}

export class CreateBookDto {
  @IsString()
  @Length(13, 13, { message: 'ISBN must be exactly 13 characters' })
  ISBN: string;

  @IsString()
  @Length(1, 100)
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBookImageDto)
  @IsOptional()
  images?: CreateBookImageDto[];

  @IsInt()
  @Min(0)
  status: number;

  @IsString()
  @Length(1, 500)
  productDescription: string;

  @IsInt()
  @Min(1, { message: 'InventoryQuantity must be greater than 0' })
  inventoryQuantity: number;

  @IsInt()
  @Min(1, { message: 'Price must be greater than 0' })
  price: number;

  @IsString()
  @Length(1, 200)
  author: string;

  @IsString()
  @Length(1, 50)
  publisher: string;

  @IsUUID('4', { message: 'MerchantID must be a valid UUID' })
  merchantId: string;
}
