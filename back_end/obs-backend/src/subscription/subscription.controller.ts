// src/subscription/subscription.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JWTGuard } from '../member/decorators/jwt-guard.decorator';
import { CurrentUser } from '../member/decorators/current-user.decorator';
import { MemberType } from '../member/member-type.enum';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  /**
   * API 功能：
   *
   * GET url/subscriptions/user/:userID            => 取得某 User 的所有訂閱
   * GET url/subscriptions/merchant/:merchantID    => 取得某 Merchant 的所有訂閱者
   * GET url/subscriptions/:userID/:merchantID     => 取得特定訂閱關係
   * POST url/subscriptions + body                 => 建立訂閱
   *   - body: { userID, merchantID, state }
   * PATCH url/subscriptions/:userID/:merchantID + body => 更新訂閱狀態
   *   - body: { state }
   * DELETE url/subscriptions/:userID/:merchantID  => 刪除訂閱
   */

  // // GET url/subscriptions
  // @Get()
  // findAll() {
  //   return this.subscriptionService.findAll();
  // }

  // GET url/subscriptions/user/:userID
  @Get('user/:userID')
  findByUser(@Param('userID') userID: string) {
    return this.subscriptionService.findByUser(userID);
  }

  // GET url/subscriptions/merchant/:merchantID
  @Get('merchant/:merchantID')
  findByMerchant(@Param('merchantID') merchantID: string) {
    return this.subscriptionService.findByMerchant(merchantID);
  }

  // GET url/subscriptions/:userID/:merchantID
  @Get(':userID/:merchantID')
  findOne(@Param('userID') userID: string, @Param('merchantID') merchantID: string) {
    return this.subscriptionService.findOne(userID, merchantID);
  }

  // POST url/subscriptions
  @JWTGuard(MemberType.User)
  @Post()
  create(@Body() createSubscriptionDto: CreateSubscriptionDto, @CurrentUser() user: any) {
    return this.subscriptionService.create(createSubscriptionDto, user);
  }

  // PATCH url/subscriptions/:userID/:merchantID
  @JWTGuard(MemberType.User)
  @Patch(':userID/:merchantID')
  update(
    @Param('userID') userID: string,
    @Param('merchantID') merchantID: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    @CurrentUser() user: any,
  ) {
    return this.subscriptionService.update(userID, merchantID, updateSubscriptionDto, user);
  }

  // DELETE url/subscriptions/:userID/:merchantID
  @JWTGuard(MemberType.User)
  @Delete(':userID/:merchantID')
  remove(@Param('userID') userID: string, @Param('merchantID') merchantID: string, @CurrentUser() user: any) {
    return this.subscriptionService.remove(userID, merchantID, user);
  }
}
