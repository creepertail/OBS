// src/belongs-to/dto/create-belongs-to.dto.ts
import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class CreateBelongsToDto {
  @IsUUID()
  @IsNotEmpty()
  bookID: string;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  categoryId: number;
}
