// src/cart/cart.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { AddsToCart } from './entities/adds-to-cart.entity';
import { Book } from '../book/entities/book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AddsToCart, Book])],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule { }
