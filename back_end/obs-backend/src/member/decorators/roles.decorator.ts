// src/member/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { MemberType } from '../member-type.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: MemberType[]) => SetMetadata(ROLES_KEY, roles);
