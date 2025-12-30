// src/report/report.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { Order } from '../order/entities/order.entity';
import { Contains } from '../order/entities/contains.entity';
import { Member } from '../member/entities/member.entity';
import { MerchantMonthlySalesView } from './entities/merchant-monthly-sales.view';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Contains, Member, MerchantMonthlySalesView])],
  providers: [ReportService],
  controllers: [ReportController],
  exports: [ReportService],
})
export class ReportModule {}
