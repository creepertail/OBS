// src/member/dto/create-member.dto.ts
import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { MemberType } from '../member-type.enum';

export class CreateMemberDto {
  @IsEmail()
  @MaxLength(40)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  account: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(12)
  phoneNumber: string;

  @IsEnum(MemberType)
  type: MemberType;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  username?: string;

  @IsInt()
  @IsOptional()
  level?: number;

  @IsInt()
  @IsOptional()
  userState?: number;

  @IsString()
  @IsOptional()
  merchantsName?: string;

  @IsInt()
  @IsOptional()
  merchantsState?: number;

  @IsString()
  @IsOptional()
  address?: string;

  @IsInt()
  @IsOptional()
  subscriberCount?: number;
}
