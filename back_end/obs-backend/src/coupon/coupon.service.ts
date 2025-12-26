// src/coupon/coupon.service.ts
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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
}

