// src/restrict_merchant/restrict-merchant.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestrictMerchantService } from './restrict-merchant.service';
import { RestrictMerchantController } from './restrict-merchant.controller';
import { RestrictMerchant } from './entities/restrict-merchant.entity';
import { Member } from '../member/entities/member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RestrictMerchant, Member])],
  controllers: [RestrictMerchantController],
  providers: [RestrictMerchantService],
  exports: [RestrictMerchantService],
})
export class RestrictMerchantModule {}

