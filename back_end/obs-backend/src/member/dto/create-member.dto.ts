// src/member/dto/create-member.dto.ts
import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { MemberType } from '../member-type.enum';

export class CreateMemberDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  account: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsEnum(MemberType)
  @IsOptional()
  type?: MemberType;

  @IsString()
  @IsNotEmpty()
  username: string;

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

