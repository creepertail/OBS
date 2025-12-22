// src/claims/dto/update-claim.dto.ts
import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class UpdateClaimDto {
  @IsInt()
  @IsPositive()
  @IsOptional()
  remaining?: number;
}

