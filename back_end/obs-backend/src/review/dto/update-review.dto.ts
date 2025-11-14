// src/review/dto/update-review.dto.ts
import { IsDateString, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UpdateReviewDto {
  @IsDateString()
  @IsOptional()
  date?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  stars?: number;

  @IsString()
  @MaxLength(200)
  @IsOptional()
  description?: string;
}

