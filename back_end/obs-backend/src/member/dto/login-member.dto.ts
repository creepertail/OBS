// src/member/dto/login-member.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginMemberDto {
  @IsString()
  @IsNotEmpty()
  account: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
