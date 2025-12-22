// src/claims/claims.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { JWTGuard } from '../member/decorators/jwt-guard.decorator';
import { CurrentUser } from '../member/decorators/current-user.decorator';
import { MemberType } from '../member/member-type.enum';

@Controller('claims')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  // 建立領券：User 為自己領，Admin 必須指定 userID
  @JWTGuard(MemberType.User, MemberType.Admin)
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

  // 依 CouponID 取得單筆（Admin 可指定 userID，User 只能查自己）
  @JWTGuard(MemberType.User, MemberType.Admin)
  @Get(':couponID')
  findOne(@Param('couponID') couponID: string, @CurrentUser() user: any, @Query('userID') userID?: string) {
    return this.claimsService.findOne(couponID, user, userID);
  }

  // 更新剩餘張數（Admin 或持有者）
  @JWTGuard(MemberType.User, MemberType.Admin)
  @Patch(':couponID')
  update(
    @Param('couponID') couponID: string,
    @Body() updateClaimDto: UpdateClaimDto,
    @CurrentUser() user: any,
    @Query('userID') userID?: string,
  ) {
    return this.claimsService.update(couponID, updateClaimDto, user, userID);
  }

  // 刪除領券（Admin 或持有者）
  @JWTGuard(MemberType.User, MemberType.Admin)
  @Delete(':couponID')
  remove(@Param('couponID') couponID: string, @CurrentUser() user: any, @Query('userID') userID?: string) {
    return this.claimsService.remove(couponID, user, userID);
  }
}

