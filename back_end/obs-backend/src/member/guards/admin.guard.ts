// src/member/guards/admin.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { MemberType } from '../member-type.enum';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 確保 JwtAuthGuard 已經先執行過
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // 檢查是否為 Admin
    if (user.type !== MemberType.Admin) {
      throw new ForbiddenException('Only admin can perform this action');
    }

    return true;
  }
}
