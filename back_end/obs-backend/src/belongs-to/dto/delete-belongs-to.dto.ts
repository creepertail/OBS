// src/belongs-to/dto/delete-belongs-to.dto.ts
import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class DeleteBelongsToDto {
  @IsUUID()
  @IsNotEmpty()
  bookID: string;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  categoryId: number;
}
