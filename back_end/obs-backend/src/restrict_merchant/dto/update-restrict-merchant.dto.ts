// src/restrict_merchant/dto/update-restrict-merchant.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateRestrictMerchantDto } from './create-restrict-merchant.dto';

export class UpdateRestrictMerchantDto extends PartialType(CreateRestrictMerchantDto) {}
