// src/manage/dto/create-manage.dto.ts
import { IsUUID } from 'class-validator';

export class CreateManageDto {
  @IsUUID()
  adminID: string;

  @IsUUID()
  couponID: string;
}

