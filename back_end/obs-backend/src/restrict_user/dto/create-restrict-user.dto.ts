// src/restrict_user/dto/create-restrict-user.dto.ts
import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class CreateRestrictUserDto {
  @IsUUID()
  @IsNotEmpty()
  userID: string;

  @IsInt()
  @Min(0)
  originalState: number;

  @IsInt()
  @Min(0)
  latestState: number;
}
