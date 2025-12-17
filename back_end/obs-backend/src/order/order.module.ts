// src/order/order.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order } from './entities/order.entity';
import { Contains } from './entities/contains.entity';
import { Member } from '../member/entities/member.entity';
import { Book } from '../book/entities/book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Contains, Member, Book])],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule { }
