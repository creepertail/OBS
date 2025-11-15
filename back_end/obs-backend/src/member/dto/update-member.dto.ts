// src/member/dto/update-member.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateMemberDto } from './create-member.dto';
import { IsEmail, IsEnum, IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { MemberType } from '../member-type.enum';

export class UpdateMemberDto extends PartialType(CreateMemberDto) {
  @IsEmail()
  @MaxLength(40)
  @IsOptional()
  email?: string;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  account?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  password?: string;

  @IsString()
  @MaxLength(12)
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  username?: string;

  @IsInt()
  @IsOptional()
  level?: number;

  @IsInt()
  @IsOptional()
  userState?: number;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  merchantName?: string;

  @IsInt()
  @IsOptional()
  merchantState?: number;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  merchantAddress?: string;

  @IsInt()
  @IsOptional()
  merchantSubscriberCount?: number;
}
