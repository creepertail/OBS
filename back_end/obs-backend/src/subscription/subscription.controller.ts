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
   * GET url/subscriptions/user/:userID                         => 取得某 User 的所有訂閱
   * GET url/subscriptions/merchant/:merchantID                 => 取得某 Merchant 的所有訂閱者
   * GET url/subscriptions/:merchantID + user's access token    => 取得特定訂閱關係
   * POST url/subscriptions + body + access token               => 建立訂閱
   *   - body: { merchantID, state }
   * PATCH url/subscriptions/:merchantID + body + user's access token => 更新訂閱狀態
   *   - body: { state }
   * DELETE url/subscriptions/:merchantID + user's access token  => 刪除訂閱
   */

  // // GET url/subscriptions
  // @Get()
  // findAll() {
  //   return this.subscriptionService.findAll();
  // }

  // GET url/subscriptions/user + access token
  @JWTGuard(MemberType.User)
  @Get('user')
  findByUser(@CurrentUser() user : any) {
    return this.subscriptionService.findByUser(user.sub);
  }

  // GET url/subscriptions/merchant/
  // @JWTGuard(MemberType.Merchant)
  // @Get('merchant')
  // findByMerchant(@CurrentUser() merchant : any) {
  //   return this.subscriptionService.findByMerchant(merchant.sub);
  // }

  // GET url/subscriptions/:merchantID
  @JWTGuard()
  @Get('isUserSubscribedToMerchant/:id')
  findOne(@CurrentUser() user : any, @Param('id') merchantID: string) {
    return this.subscriptionService.findOne(user.sub, merchantID);
  }

  // POST url/subscriptions
  @JWTGuard(MemberType.User)
  @Post()
  create(@Body() createSubscriptionDto: CreateSubscriptionDto, @CurrentUser() user: any) {
    return this.subscriptionService.create(createSubscriptionDto, user);
  }

  // PATCH url/subscriptions/:merchantID
  @JWTGuard(MemberType.User)
  @Patch(':merchantID')
  update(
    @CurrentUser() user: any,
    @Param('merchantID') merchantID: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionService.update(user.sub, merchantID, updateSubscriptionDto);
  }

  // DELETE url/subscriptions/:merchantID
  @JWTGuard(MemberType.User)
  @Delete(':merchantID')
  remove(@CurrentUser() user: any, @Param('merchantID') merchantID: string) {
    return this.subscriptionService.remove(user.sub, merchantID);
  }
}
