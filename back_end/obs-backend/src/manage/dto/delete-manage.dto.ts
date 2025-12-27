// src/manage/dto/delete-manage.dto.ts
import { IsUUID } from 'class-validator';

export class DeleteManageDto {
  @IsUUID()
  adminID: string;

  @IsUUID()
  couponID: string;
}

