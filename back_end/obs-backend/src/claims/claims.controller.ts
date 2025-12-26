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

  // Admin 取得全部領券紀錄
  @JWTGuard(MemberType.Admin)
  @Get()
  findAll() {
    return this.claimsService.findAll();
  }

  // 依 ClaimID 取得單筆（Admin 任意；User 僅能查自己的）
  @JWTGuard(MemberType.User, MemberType.Admin)
  @Get(':claimID')
  findOne(@Param('claimID') claimID: string, @CurrentUser() user: any) {
    return this.claimsService.findOne(claimID, user);
  }

  // 更新領券紀錄（Admin 或本人）
  @JWTGuard(MemberType.User, MemberType.Admin)
  @Patch(':claimID')
  update(@Param('claimID') claimID: string, @Body() updateClaimDto: UpdateClaimDto, @CurrentUser() user: any) {
    return this.claimsService.update(claimID, updateClaimDto, user);
  }

  // 刪除領券紀錄（Admin 或本人）
  @JWTGuard(MemberType.User, MemberType.Admin)
  @Delete(':claimID')
  remove(@Param('claimID') claimID: string, @CurrentUser() user: any) {
    return this.claimsService.remove(claimID, user);
  }
}
