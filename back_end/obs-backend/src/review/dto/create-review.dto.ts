// src/review/dto/create-review.dto.ts
import { IsDateString, IsInt, IsNotEmpty, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  bookID: string;

  @IsDateString()
  date: string;

  @IsInt()
  @Min(1)
  @Max(5)
  stars: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  description: string;
}
