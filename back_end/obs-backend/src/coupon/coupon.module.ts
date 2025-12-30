// src/coupon/coupon.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { Coupon } from './entities/coupon.entity';
import { Member } from '../member/entities/member.entity';
import { Manage } from '../manage/entities/manage.entity';
import { Claim } from '../claims/entities/claim.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Coupon, Member, Manage, Claim])],
  controllers: [CouponController],
  providers: [CouponService],
  exports: [CouponService],
})
export class CouponModule {}
