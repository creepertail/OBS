// src/coupon/coupon.service.ts
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, MoreThan, Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Member } from '../member/entities/member.entity';
import { MemberType } from '../member/member-type.enum';
import { Claim } from '../claims/entities/claim.entity';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Claim)
    private readonly claimRepository: Repository<Claim>,
  ) {}

  async create(createCouponDto: CreateCouponDto, currentUser: { sub: string; type: MemberType }): Promise<Coupon> {
    // 僅 Admin 或 Merchant，可發給自己：Admin -> Admin 自己（全商城券）；Merchant -> 自家券
    if (currentUser.type === MemberType.Admin) {
      if (createCouponDto.memberID !== currentUser.sub) {
        throw new ForbiddenException('Admin can only create coupons for themselves');
      }
      await this.ensureMemberRole(createCouponDto.memberID, MemberType.Admin);
    } else if (currentUser.type === MemberType.Merchant) {
      if (createCouponDto.memberID !== currentUser.sub) {
        throw new ForbiddenException('Merchant can only create coupons for themselves');
      }
      await this.ensureMemberRole(createCouponDto.memberID, MemberType.Merchant);
    } else {
      throw new ForbiddenException('Only admin or merchant can create coupons');
    }

    // 兌換碼需唯一
    const existingCode = await this.couponRepository.findOne({ where: { redemptionCode: createCouponDto.redemptionCode } });
    if (existingCode) {
      throw new ConflictException('Redemption code already exists');
    }

    const coupon = this.couponRepository.create({
      ...createCouponDto,
      validDate: createCouponDto.validDate ? new Date(createCouponDto.validDate) : undefined,
    });

    return this.couponRepository.save(coupon);
  }

  async findAll(options?: { onlyAvailable?: boolean; discountType?: number; userID?: string }): Promise<Coupon[]> {
    const filters: FindOptionsWhere<Coupon>[] = options?.onlyAvailable
      ? [
          { quantity: MoreThan(0), validDate: IsNull() },
          { quantity: MoreThan(0), validDate: MoreThan(new Date()) },
        ]
      : [{}];

    if (options?.discountType !== undefined) {
      filters.forEach((filter) => {
        filter.discountType = options.discountType;
      });
    }

    let coupons = await this.couponRepository.find({ where: filters });

    if (options?.userID) {
      const userClaims = await this.claimRepository.find({ where: { userID: options.userID } });
      const claimedCouponIDs = new Set(userClaims.map((claim) => claim.couponID));
      coupons = coupons.filter((coupon) => !claimedCouponIDs.has(coupon.couponID));
    }

    return coupons;
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
      if (currentUser.type === MemberType.Admin) {
        if (updateCouponDto.memberID !== currentUser.sub) {
          throw new ForbiddenException('Admin can only assign coupon to themselves');
        }
        await this.ensureMemberRole(updateCouponDto.memberID, MemberType.Admin);
      } else if (currentUser.type === MemberType.Merchant) {
        if (updateCouponDto.memberID !== currentUser.sub) {
          throw new ForbiddenException('Merchant can only keep coupon for themselves');
        }
        await this.ensureMemberRole(updateCouponDto.memberID, MemberType.Merchant);
      } else {
        throw new ForbiddenException('Only admin or merchant can update coupons');
      }
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

  private async ensureMemberRole(memberID: string, role: MemberType): Promise<void> {
    const member = await this.memberRepository.findOne({ where: { memberID } });
    if (!member) {
      throw new NotFoundException(`Member with ID ${memberID} not found`);
    }
    if (member.type !== role) {
      throw new ForbiddenException(`Target member must be ${role}`);
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

  async eligibility(
    userId: string,
    options?: { merchantId?: string; discountType?: number },
  ): Promise<{
    claimable: Array<Coupon>;
    blocked: Array<{ coupon: Coupon; reason: string }>;
  }> {
    const user = await this.memberRepository.findOne({ where: { memberID: userId, type: MemberType.User } });
    if (!user) {
      throw new ForbiddenException('Only users can view coupon eligibility');
    }

    const userClaims = await this.claimRepository.find({ where: { userID: userId } });
    const claimCountMap = userClaims.reduce<Record<string, number>>((acc, claim) => {
      acc[claim.couponID] = (acc[claim.couponID] || 0) + 1;
      return acc;
    }, {});

    // 只查詢未過期且有庫存的優惠券
    const filters: FindOptionsWhere<Coupon>[] = [
      { quantity: MoreThan(0), validDate: IsNull() },
      { quantity: MoreThan(0), validDate: MoreThan(new Date()) },
    ];

    if (options?.discountType !== undefined) {
      filters.forEach((f) => (f.discountType = options.discountType));
    }

    const coupons = await this.couponRepository.find({ where: filters });
    const now = Date.now();
    const claimable: Coupon[] = [];
    const blocked: Array<{ coupon: Coupon; reason: string }> = [];

    for (const coupon of coupons) {
      const reasons: string[] = [];
      if (coupon.quantity <= 0) reasons.push('已無庫存');
      if (coupon.validDate && coupon.validDate.getTime() < now) reasons.push('已過期');

      const count = claimCountMap[coupon.couponID] || 0;
      if (count >= 1) reasons.push('已領取過');

      if (coupon.discountType === 0) {
        if (!options?.merchantId) {
          reasons.push('缺少 merchantId');
        } else if (coupon.memberID !== options.merchantId) {
          reasons.push('商家不符');
        }
      }

      if (reasons.length === 0) {
        claimable.push(coupon);
      } else {
        blocked.push({ coupon, reason: reasons.join('、') });
      }
    }

    return { claimable, blocked };
  }
}
