// src/member/decorators/jwt-guard.decorator.ts
import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';
import { MemberType } from '../member-type.enum';

/**
 * 組合型的 JWT 驗證裝飾器
 *
 * 使用方式：
 * - @JWTGuard(MemberType.User) - 只允許 User 角色
 * - @JWTGuard(MemberType.User, MemberType.Merchant) - 允許 User 或 Merchant 角色
 * - @JWTGuard() - 只驗證 JWT，不限制角色
 *
 * @param roles 允許的角色列表
 */
export function JWTGuard(...roles: MemberType[]) {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(...roles),
  );
}
