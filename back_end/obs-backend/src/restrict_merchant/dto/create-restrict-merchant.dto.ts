// src/restrict_merchant/dto/create-restrict-merchant.dto.ts
import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class CreateRestrictMerchantDto {
  @IsUUID()
  @IsNotEmpty()
  adminID: string;

  @IsUUID()
  @IsNotEmpty()
  merchantID: string;

  @IsInt()
  @Min(0)
  originalState: number;

  @IsInt()
  @Min(0)
  latestState: number;
}
