// src/book/dto/create-book.dto.ts
import { IsString, IsInt, IsOptional, Min, Length, IsArray, ValidateNested, IsBoolean } from 'class-validator';
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
  Name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBookImageDto)
  @IsOptional()
  images?: CreateBookImageDto[];

  @IsInt()
  @Min(0)
  Status: number;

  @IsString()
  @Length(1, 500)
  ProductDescription: string;

  @IsInt()
  @Min(1, { message: 'InventoryQuantity must be greater than 0' })
  InventoryQuantity: number;

  @IsInt()
  @Min(1, { message: 'Price must be greater than 0' })
  Price: number;

  @IsString()
  @Length(1, 200)
  Author: string;

  @IsString()
  @Length(1, 50)
  Publisher: string;

  @IsString()
  MerchantID: string;
}
