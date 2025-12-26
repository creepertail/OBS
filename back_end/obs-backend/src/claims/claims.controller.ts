// src/claims/claims.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { JWTGuard } from '../member/decorators/jwt-guard.decorator';
import { CurrentUser } from '../member/decorators/current-user.decorator';
import { MemberType } from '../member/member-type.enum';

@Controller('claims')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  // 使用者兌換優惠碼領券
  @JWTGuard(MemberType.User)
  @Post()
  create(@Body() createClaimDto: CreateClaimDto, @CurrentUser() user: any) {
    return this.claimsService.create(createClaimDto, user);
  }

  // 取得自己領到的優惠券
  @JWTGuard(MemberType.User, MemberType.Admin)
  @Get('mine')
  findMine(@CurrentUser() user: any) {
    return this.claimsService.findMine(user.sub);
  }

  // Admin 查全部
  @JWTGuard(MemberType.Admin)
  @Get()
  findAll() {
    return this.claimsService.findAll();
  }

  // 依 ClaimID 取得單筆（Admin 可看全部，User 只能看自己）
  @JWTGuard(MemberType.User, MemberType.Admin)
  @Get(':claimID')
  findOne(@Param('claimID') claimID: string, @CurrentUser() user: any) {
    return this.claimsService.findOne(claimID, user);
  }

  // 更新狀態（Admin 或持有者）
  @JWTGuard(MemberType.User, MemberType.Admin)
  @Patch(':claimID')
  update(@Param('claimID') claimID: string, @Body() updateClaimDto: UpdateClaimDto, @CurrentUser() user: any) {
    return this.claimsService.update(claimID, updateClaimDto, user);
  }

  // 刪除領券（Admin 或持有者）
  @JWTGuard(MemberType.User, MemberType.Admin)
  @Delete(':claimID')
  remove(@Param('claimID') claimID: string, @CurrentUser() user: any) {
    return this.claimsService.remove(claimID, user);
  }
}
