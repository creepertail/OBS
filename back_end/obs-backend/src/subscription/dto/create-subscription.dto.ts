// src/subscription/dto/create-subscription.dto.ts
import { IsIn, IsInt, IsUUID } from 'class-validator';

export class CreateSubscriptionDto {
  @IsUUID()
  userID: string;

  @IsUUID()
  merchantID: string;

  @IsInt()
  @IsIn([0, 1])
  state: number;
}

