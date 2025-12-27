// src/cart/cart.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JWTGuard } from '../member/decorators/jwt-guard.decorator';
import { MemberType } from '../member/member-type.enum';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) { }

  // POST /cart - 新增商品到購物車（累加數量）
  @Post()
  @JWTGuard(MemberType.User)
  addItem(
    @Body(new ValidationPipe()) createCartItemDto: CreateCartItemDto,
    @Request() req,
  ) {
    const userId = req.member.sub;
    return this.cartService.addItem(userId, createCartItemDto);
  }

  // GET /cart - 取得目前使用者的購物車清單
  @Get()
  @JWTGuard(MemberType.User)
  findMyCart(@Request() req) {
    const userId = req.member.sub;
    return this.cartService.findMyCart(userId);
  }

  // GET /cart/:merchantID - 根據 MerChantID 跟 Access Token 找 Cart 的商品
  @Get(":merchanId")
  @JWTGuard(MemberType.User)
  findItemsInMyCartByMerchantID(
    @Param('merchanId', ParseUUIDPipe) merchanId: string,
    @Request() req
  ) {
    const userId = req.member.sub;
    return this.cartService.findItemsInMyCartByMerchantID(userId, merchanId);
  }


  // PATCH /cart/:bookId - 更新指定商品的數量
  @Patch(':bookId')
  @JWTGuard(MemberType.User)
  updateItem(
    @Param('bookId', ParseUUIDPipe) bookId: string,
    @Body(new ValidationPipe()) updateCartItemDto: UpdateCartItemDto,
    @Request() req,
  ) {
    const userId = req.member.sub;
    return this.cartService.updateItem(userId, bookId, updateCartItemDto);
  }

  // DELETE /cart/merchant/:merchantId - 刪除購物車中屬於指定商家的商品
  @Delete('merchant/:merchantId')
  @JWTGuard(MemberType.User)
  removeItemsByMerchantID(
    @Param('merchantId', ParseUUIDPipe) merchantId: string,
    @Request() req,
  ) {
    const userId = req.member.sub;
    return this.cartService.removeItemsByMerchantID(userId, merchantId);
  }

  // DELETE /cart/:bookId - 移除單一商品
  @Delete(':bookId')
  @JWTGuard(MemberType.User)
  removeItem(
    @Param('bookId', ParseUUIDPipe) bookId: string,
    @Request() req,
  ) {
    const userId = req.member.sub;
    return this.cartService.removeItem(userId, bookId);
  }

  // DELETE /cart - 清空購物車
  @Delete()
  @JWTGuard(MemberType.User)
  clearCart(@Request() req) {
    const userId = req.member.sub;
    return this.cartService.clearCart(userId);
  }
}
