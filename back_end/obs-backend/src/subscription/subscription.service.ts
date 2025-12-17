// src/subscription/subscription.service.ts
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Int32, IntegerType, Repository } from 'typeorm';
import { Subscribes } from './entities/subscribes.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';
import { Member } from '../member/entities/member.entity';
import { MemberType } from '../member/member-type.enum';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscribes)
    private readonly subscriptionRepository: Repository<Subscribes>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  // 格式化回傳資料
  private formatResponse(subscription: Subscribes): SubscriptionResponseDto {
    return {
      userID: subscription.userID,
      userName: subscription.user?.userName || '',
      merchantID: subscription.merchantID,
      merchantName: subscription.merchant?.merchantName || '',
      notificationEnabled: subscription.notificationEnabled,
    };
  }

  // 取得所有訂閱關係
  async findAll(): Promise<SubscriptionResponseDto[]> {
    const subscriptions = await this.subscriptionRepository.find({
      relations: ['user', 'merchant'],
    });
    return subscriptions.map((sub) => this.formatResponse(sub));
  }

  // 根據 UserID 和 MerchantID 取得特定訂閱（內部使用，回傳完整 entity）
  private async findOneEntity(userID: string, merchantID: string): Promise<Subscribes> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { userID, merchantID },
      relations: ['user', 'merchant'],
    });
    if (!subscription) {
      throw new NotFoundException(`Subscription not found for user ${userID} and merchant ${merchantID}`);
    }
    return subscription;
  }

  // 根據 UserID 和 MerchantID 取得特定訂閱（API 使用，回傳簡化資料）
  async findOne(userID: string, merchantID: string): Promise<SubscriptionResponseDto> {
    const subscription = await this.findOneEntity(userID, merchantID);
    return this.formatResponse(subscription);
  }

  // 取得某 User 的所有訂閱
  async findByUser(userID: string): Promise<SubscriptionResponseDto[]> {
    const subscriptions = await this.subscriptionRepository.find({
      where: { userID },
      relations: ['user', 'merchant'],
    });
    return subscriptions.map((sub) => this.formatResponse(sub));
  }

  // 取得某 Merchant 的所有訂閱者
  async findByMerchant(merchantID: string): Promise<SubscriptionResponseDto[]> {
    const subscriptions = await this.subscriptionRepository.find({
      where: { merchantID },
      relations: ['user', 'merchant'],
    });
    return subscriptions.map((sub) => this.formatResponse(sub));
  }

  // 取得某 Merchant 的訂閱者數量
  async findSubscriptionCountByMerchant(merchantID: string): Promise<IntegerType> {
    return this.subscriptionRepository.count({
      where: { merchantID },
      relations: ['user'],
    });
  }

  // 建立訂閱
  async create(createSubscriptionDto: CreateSubscriptionDto, currentUser: { sub: string; type: MemberType; account: string }): Promise<SubscriptionResponseDto> {
    const { merchantID } = createSubscriptionDto;
    const userID = currentUser.sub;

    // 驗證 User 存在且類型為 User
    const user = await this.memberRepository.findOne({ where: { memberID: userID } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userID} not found`);
    }
    if (user.type !== MemberType.User) {
      throw new ConflictException('Only users can subscribe to merchants');
    }

    // 驗證 Merchant 存在且類型為 Merchant
    const merchant = await this.memberRepository.findOne({ where: { memberID: merchantID } });
    if (!merchant) {
      throw new NotFoundException(`Merchant with ID ${merchantID} not found`);
    }
    if (merchant.type !== MemberType.Merchant) {
      throw new ConflictException('Can only subscribe to merchants');
    }
    // 檢查是否已經訂閱
    const existingSubscription = await this.subscriptionRepository.findOne({
      where: { userID, merchantID },
    });
    if (existingSubscription) {
      throw new ConflictException('Subscription already exists');
    }

    const subscription = this.subscriptionRepository.create({
      ...createSubscriptionDto,
      userID,
    });
    await this.subscriptionRepository.save(subscription);

    // 更新 Merchant 的訂閱者數量
    merchant.merchantSubscriberCount = (merchant.merchantSubscriberCount || 0) + 1;
    await this.memberRepository.save(merchant);

    // 回傳格式化資料
    return {
      userID,
      userName: user.userName || '',
      merchantID,
      merchantName: merchant.merchantName || '',
      notificationEnabled: createSubscriptionDto.notificationEnabled ?? false,
    };
  }

  // 更新訂閱狀態
  async update(userID: string, merchantID: string, updateSubscriptionDto: UpdateSubscriptionDto, currentUser: { sub: string; type: MemberType; account: string }): Promise<SubscriptionResponseDto> {
    // 驗證當前用戶只能更新自己的訂閱（除非是 Admin）
    if (currentUser.type !== MemberType.Admin && currentUser.sub !== userID) {
      throw new ForbiddenException('You can only update your own subscription');
    }

    const subscription = await this.findOneEntity(userID, merchantID);
    Object.assign(subscription, updateSubscriptionDto);
    const updatedSubscription = await this.subscriptionRepository.save(subscription);
    return this.formatResponse(updatedSubscription);
  }

  // 刪除訂閱
  async remove(userID: string, merchantID: string, currentUser: { sub: string; type: MemberType; account: string }): Promise<void> {
    // 驗證當前用戶只能刪除自己的訂閱（除非是 Admin）
    if (currentUser.type !== MemberType.Admin && currentUser.sub !== userID) {
      throw new ForbiddenException('You can only remove your own subscription');
    }

    await this.findOneEntity(userID, merchantID);
    await this.subscriptionRepository.delete({ userID, merchantID });

    // 更新 Merchant 的訂閱者數量
    const merchant = await this.memberRepository.findOne({ where: { memberID: merchantID } });
    if (merchant && merchant.merchantSubscriberCount && merchant.merchantSubscriberCount > 0) {
      merchant.merchantSubscriberCount -= 1;
      await this.memberRepository.save(merchant);
    }
  }
}
