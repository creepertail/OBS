// src/claims/dto/create-claim.dto.ts
import { IsInt, IsOptional, IsPositive, IsUUID } from 'class-validator';

export class CreateClaimDto {
  @IsUUID()
  couponID: string;

  @IsUUID()
  @IsOptional()
  userID?: string;

  @IsInt()
  @IsPositive()
  remaining: number;
}

