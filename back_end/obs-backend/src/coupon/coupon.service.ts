// src/coupon/coupon.service.ts
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Member } from '../member/entities/member.entity';
import { MemberType } from '../member/member-type.enum';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  async create(createCouponDto: CreateCouponDto, currentUser: { sub: string; type: MemberType }): Promise<Coupon> {
    // 僅 Admin 或 Merchant 可建立；Merchant 只能為自己；Admin 也僅能發給 Merchant
    if (currentUser.type !== MemberType.Admin && currentUser.type !== MemberType.Merchant) {
      throw new ForbiddenException('Only admin or merchant can create coupons');
    }
    if (currentUser.type === MemberType.Merchant && createCouponDto.memberID !== currentUser.sub) {
      throw new ForbiddenException('Merchant can only create coupons for themselves');
    }

    await this.ensureMerchantExists(createCouponDto.memberID);

    const coupon = this.couponRepository.create({
      ...createCouponDto,
      validDate: createCouponDto.validDate ? new Date(createCouponDto.validDate) : undefined,
    });

    return this.couponRepository.save(coupon);
  }

  findAll(): Promise<Coupon[]> {
    return this.couponRepository.find();
  }

  async findByOwner(memberID: string): Promise<Coupon[]> {
    return this.couponRepository.find({ where: { memberID } });
  }

  async findOne(id: string, currentUser: { sub: string; type: MemberType }): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { couponID: id },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }

    this.ensureCanAccess(coupon, currentUser);

    return coupon;
  }

  async update(id: string, updateCouponDto: UpdateCouponDto, currentUser: { sub: string; type: MemberType }): Promise<Coupon> {
    const coupon = await this.findOne(id, currentUser);

    if (updateCouponDto.memberID) {
      // 非 Admin 不可轉移；Admin 也只能轉給商家
      if (currentUser.type !== MemberType.Admin && updateCouponDto.memberID !== currentUser.sub) {
        throw new ForbiddenException('You can only assign coupon to yourself');
      }
      await this.ensureMerchantExists(updateCouponDto.memberID);
    }

    if (updateCouponDto.validDate !== undefined) {
      coupon.validDate = updateCouponDto.validDate ? new Date(updateCouponDto.validDate) : undefined;
    }

    Object.assign(coupon, {
      ...updateCouponDto,
      validDate: coupon.validDate,
    });

    return this.couponRepository.save(coupon);
  }

  async remove(id: string, currentUser: { sub: string; type: MemberType }): Promise<void> {
    const coupon = await this.findOne(id, currentUser);
    await this.couponRepository.remove(coupon);
  }

  private async ensureMerchantExists(memberID: string): Promise<void> {
    const member = await this.memberRepository.findOne({ where: { memberID } });
    if (!member) {
      throw new NotFoundException(`Member with ID ${memberID} not found`);
    }
    if (member.type !== MemberType.Merchant) {
      throw new ForbiddenException('Coupons can only be created for merchants');
    }
  }

  private ensureCanAccess(coupon: Coupon, currentUser: { sub: string; type: MemberType }): void {
    if (currentUser.type === MemberType.Admin) {
      return;
    }

    if (coupon.memberID !== currentUser.sub) {
      throw new ForbiddenException('You can only access your own coupons');
    }
  }
}
