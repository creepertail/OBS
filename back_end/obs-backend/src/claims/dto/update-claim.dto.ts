// src/claims/dto/update-claim.dto.ts
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateClaimDto {
  @IsInt()
  @Min(0)
  @Max(2)
  @IsOptional()
  state?: number;
}
