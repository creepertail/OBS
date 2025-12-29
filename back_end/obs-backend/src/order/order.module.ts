// src/order/order.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order } from './entities/order.entity';
import { Contains } from './entities/contains.entity';
import { Member } from '../member/entities/member.entity';
import { Book } from '../book/entities/book.entity';
import { AddsToCart } from '../cart/entities/adds-to-cart.entity';
import { Claim } from '../claims/entities/claim.entity';
import { Coupon } from '../coupon/entities/coupon.entity';
import { MemberModule } from '../member/member.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Contains, Member, Book, AddsToCart, Claim, Coupon]),
    MemberModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule { }
