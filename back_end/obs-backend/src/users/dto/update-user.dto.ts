// src/users/dto/create-user.dto.ts
import { IsEmail, IsNotEmpty, MinLength, IsString, MaxLength, IsUUID } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @MaxLength(40)
  email: string;

  @IsString()
  @MaxLength(20)
  account: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  @IsString()
  @MaxLength(20)
  username: string;

  @IsString()
  @MaxLength(12)
  phone: string;
}