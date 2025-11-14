// src/subscription/dto/update-subscription.dto.ts
import { IsIn, IsInt } from 'class-validator';

export class UpdateSubscriptionDto {
  @IsInt()
  @IsIn([0, 1])
  state: number;
}

