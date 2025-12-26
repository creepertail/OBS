// src/order/order.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JWTGuard } from '../member/decorators/jwt-guard.decorator';
import { MemberType } from '../member/member-type.enum';

interface CreateOrderItem {
  bookId: string;
  quantity: number;
}

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  /**
   * API 功能：
   *
   * POST /orders + body              => 建立新訂單（需要 JWT token，User 類型）
   *   - body:
   *   - shippingAddress, paymentMethod, totalPrice, totalQuantity, couponId (optional)
   *   - items: [{ bookId, quantity }]
   *   - 注意：userId 從 JWT token 自動取得，merchantId 從書籍資料自動取得
   *   - 所有書籍必須屬於同一個商家
   *
   * GET /orders                      => 查詢所有訂單（根據使用者類型過濾）
   *   - User: 只能看到自己的訂單
   *   - Merchant: 只能看到自己商店的訂單
   *   - Admin: 可以看到所有訂單
   *
   * GET /orders/me                   => 查詢自己的訂單（User）
   *
   * GET /orders/:id                  => 根據 ID 查詢訂單（需要權限驗證）
   *
   * PATCH /orders/:id + body         => 更新訂單
   *   - User: 只能修改 shippingAddress 和 paymentMethod
   *   - Merchant: 只能修改 state（訂單狀態）
   *   - Admin: 可以修改所有欄位
   *
   * DELETE /orders/:id               => 刪除訂單（只有 User 和 Admin 可以刪除）
   */

  /**
   * POST /orders - 建立新訂單
   */
  @Post()
  @JWTGuard(MemberType.User)
  create(
    // ValidationPipe 自行驗證 body 的格式
    @Body(new ValidationPipe()) body: CreateOrderDto & { items: CreateOrderItem[] },
    @Request() req
  ) {
    const userId = req.member.sub;
    const { items, ...createOrderDto } = body;
    return this.orderService.create(createOrderDto, userId, items);
  }

  /**
   * GET /orders - 查詢所有訂單（根據使用者類型過濾）
   */
  @Get()
  @JWTGuard()
  findAll(@Request() req) {
    const userId = req.member.sub;
    const userType = req.member.type;
    return this.orderService.findAll(userId, userType);
  }

  /**
   * GET /orders/me - 查詢自己的訂單
   */
  @Get('me')
  @JWTGuard(MemberType.User)
  findMyOrders(@Request() req) {
    const userId = req.member.sub;
    return this.orderService.findByUserId(userId);
  }

  /**
   * GET /orders/:id - 根據 ID 查詢訂單
   */
  @Get(':id')
  @JWTGuard()
  findOne(@Param('id') id: string, @Request() req) {
    const requesterId = req.member.sub;
    const requesterType = req.member.type;
    return this.orderService.findByID(id, requesterId, requesterType);
  }

  /**
   * PATCH /orders/:id - 更新訂單
   */
  @Patch(':id')
  @JWTGuard()
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateOrderDto: UpdateOrderDto,
    @Request() req
  ) {
    const requesterId = req.member.sub;
    const requesterType = req.member.type;
    return this.orderService.update(id, updateOrderDto, requesterId, requesterType);
  }

  /**
   * DELETE /orders/:id - 刪除訂單
   */
  @Delete(':id')
  @JWTGuard()
  remove(@Param('id') id: string, @Request() req) {
    const requesterId = req.member.sub;
    const requesterType = req.member.type;
    return this.orderService.remove(id, requesterId, requesterType);
  }
}
