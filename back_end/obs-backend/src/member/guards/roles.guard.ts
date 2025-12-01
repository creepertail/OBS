// src/member/guards/roles.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { MemberType } from '../member-type.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<MemberType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 如果沒有設定角色要求，則允許通過
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const member = request.member;

    // 確保使用者已經通過 JWT 驗證
    if (!member) {
      throw new ForbiddenException('Member not authenticated');
    }

    // Admin 擁有最高權限，可以訪問所有端點
    if (member.type === MemberType.Admin) {
      return true;
    }

    // 檢查使用者的角色是否在允許的角色列表中
    const hasRole = requiredRoles.some((role) => member.type === role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required member roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
