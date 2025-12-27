// src/restrict_user/dto/update-restrict-user.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateRestrictUserDto } from './create-restrict-user.dto';

export class UpdateRestrictUserDto extends PartialType(CreateRestrictUserDto) {}
