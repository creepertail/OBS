// src/claims/dto/create-claim.dto.ts
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateClaimDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  redemptionCode: string;
}
