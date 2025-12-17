// src/subscription/dto/create-subscription.dto.ts
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class CreateSubscriptionDto {
  @IsUUID()
  merchantID: string;

  @IsBoolean()
  @IsOptional()
  notificationEnabled?: boolean; // 預設為 false
}

