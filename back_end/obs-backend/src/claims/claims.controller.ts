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

  // 使用兌換碼領取優惠券（僅 User）
  @JWTGuard(MemberType.User)
  @Post()
  create(@Body() createClaimDto: CreateClaimDto, @CurrentUser() user: any) {
    return this.claimsService.create(createClaimDto, user);
  }

  // 查詢自己的領券紀錄（User/Admin 均可查詢自己的）
  @JWTGuard(MemberType.User, MemberType.Admin)
  @Get('mine')
  findMine(@CurrentUser() user: any) {
    return this.claimsService.findMine(user.sub);
  }

  // 查詢「結帳時可用」的優惠券列表（需帶 merchantId，僅 User）
  @JWTGuard(MemberType.User)
  @Get('usable')
  findUsable(@Query('merchantId') merchantId: string, @CurrentUser() user: any) {
    return this.claimsService.findUsable(user.sub, merchantId);
  }

  // Admin 取得全部領券紀錄
  @JWTGuard(MemberType.Admin)
  @Get()
  findAll() {
    return this.claimsService.findAll();
  }

  // 依 ClaimID 取得單筆（Admin 任意；User 僅能查自己的）
  @JWTGuard(MemberType.User, MemberType.Admin)
  @Get(':couponID')
  findOne(@Param('couponID') couponID: string, @CurrentUser() user: any) {
    return this.claimsService.findOne(couponID, user);
  }

  // 更新領券紀錄（Admin 或本人）
  @JWTGuard(MemberType.User, MemberType.Admin)
  @Patch(':couponID')
  update(@Param('couponID') couponID: string, @Body() updateClaimDto: UpdateClaimDto, @CurrentUser() user: any) {
    return this.claimsService.update(couponID, updateClaimDto, user);
  }

  // 刪除領券紀錄（Admin 或本人）
  @JWTGuard(MemberType.User, MemberType.Admin)
  @Delete(':couponID')
  remove(@Param('couponID') couponID: string, @CurrentUser() user: any) {
    return this.claimsService.remove(couponID, user);
  }
}
