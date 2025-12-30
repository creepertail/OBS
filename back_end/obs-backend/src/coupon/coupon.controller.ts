// src/coupon/coupon.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { JWTGuard } from '../member/decorators/jwt-guard.decorator';
import { CurrentUser } from '../member/decorators/current-user.decorator';
import { MemberType } from '../member/member-type.enum';

@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  // 建立優惠券：非 Admin 只能替自己建立，Admin 可替任意 member 建立
  @JWTGuard()
  @Post()
  create(@Body() createCouponDto: CreateCouponDto, @CurrentUser() user: any) {
    return this.couponService.create(createCouponDto, user);
  }

  // 取得自己擁有的優惠券
  @JWTGuard()
  @Get('mine')
  findMine(@CurrentUser() user: any) {
    return this.couponService.findByOwner(user.sub);
  }

  // User：查看哪些券可領/不可領（含原因），可選 merchantId、discountType
  @JWTGuard(MemberType.User)
  @Get('eligibility')
  checkEligibility(
    @CurrentUser() user: any,
    @Query('merchantId') merchantId?: string,
    @Query('discountType') discountType?: string,
  ) {
    const parsedDiscountType = discountType !== undefined ? Number(discountType) : undefined;
    const hasValidDiscountType = parsedDiscountType !== undefined && !Number.isNaN(parsedDiscountType);

    return this.couponService.eligibility(user.sub, {
      merchantId,
      discountType: hasValidDiscountType ? parsedDiscountType : undefined,
    });
  }

  // User/商家：只看可兌換的優惠券（未過期且有庫存，可選 discountType）
  @JWTGuard()
  @Get('available')
  findAvailable(@Query('discountType') discountType?: string) {
    const parsedDiscountType = discountType !== undefined ? Number(discountType) : undefined;
    const hasValidDiscountType = parsedDiscountType !== undefined && !Number.isNaN(parsedDiscountType);

    return this.couponService.findAll({
      onlyAvailable: true,
      discountType: hasValidDiscountType ? parsedDiscountType : undefined,
    });
  }

  // Admin 專用：取得所有優惠券
  @JWTGuard(MemberType.Admin)
  @Get()
  findAll(@Query('available') available?: string, @Query('discountType') discountType?: string) {
    const onlyAvailable = available === 'true';
    const parsedDiscountType = discountType !== undefined ? Number(discountType) : undefined;
    const hasValidDiscountType = parsedDiscountType !== undefined && !Number.isNaN(parsedDiscountType);

    return this.couponService.findAll({
      onlyAvailable,
      discountType: hasValidDiscountType ? parsedDiscountType : undefined,
    });
  }

  // 取得單一優惠券（Admin 可看全部，其他人只能看自己的）
  @JWTGuard()
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.couponService.findOne(id, user);
  }

  // 更新優惠券（Admin 或擁有者）
  @JWTGuard()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto, @CurrentUser() user: any) {
    return this.couponService.update(id, updateCouponDto, user);
  }

  // 刪除優惠券（Admin 或擁有者）
  @JWTGuard()
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.couponService.remove(id, user);
  }
}
