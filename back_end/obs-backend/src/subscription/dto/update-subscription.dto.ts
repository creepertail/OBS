// src/subscription/dto/update-subscription.dto.ts
import { IsBoolean } from 'class-validator';

export class UpdateSubscriptionDto {
  @IsBoolean()
  notificationEnabled: boolean;
}

