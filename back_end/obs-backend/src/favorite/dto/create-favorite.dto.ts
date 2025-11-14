// src/favorite/dto/create-favorite.dto.ts
import { IsUUID } from 'class-validator';

export class CreateFavoriteDto {
  @IsUUID()
  userID: string;

  @IsUUID()
  bookID: string;
}

