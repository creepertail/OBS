// src/claims/claims.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClaimsService } from './claims.service';
import { ClaimsController } from './claims.controller';
import { Claim } from './entities/claim.entity';
import { Member } from '../member/entities/member.entity';
import { Coupon } from '../coupon/entities/coupon.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Claim, Member, Coupon])],
  controllers: [ClaimsController],
  providers: [ClaimsService],
  exports: [ClaimsService],
})
export class ClaimsModule {}

