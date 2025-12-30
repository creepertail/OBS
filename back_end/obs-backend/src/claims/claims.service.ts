// src/claims/claims.service.ts
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Claim } from './entities/claim.entity';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { Member } from '../member/entities/member.entity';
import { Coupon } from '../coupon/entities/coupon.entity';
import { MemberType } from '../member/member-type.enum';

@Injectable()
export class ClaimsService {
  constructor(
    @InjectRepository(Claim)
    private readonly claimsRepository: Repository<Claim>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
  ) {}

  async create(createClaimDto: CreateClaimDto, currentUser: { sub: string; type: MemberType }): Promise<Claim> {
    if (currentUser.type !== MemberType.User) {
      throw new ForbiddenException('Only users can claim coupons');
    }

    const coupon = await this.couponRepository.findOne({
      where: { redemptionCode: createClaimDto.redemptionCode },
    });
    if (!coupon) {
      throw new NotFoundException('Coupon not found for this redemption code');
    }

    await this.ensureUserExists(currentUser.sub);

    const existingClaim = await this.claimsRepository.findOne({
      where: { userID: currentUser.sub, couponID: coupon.couponID },
    });
    if (existingClaim) {
      throw new ConflictException('You have already claimed this coupon');
    }

    if (coupon.validDate && coupon.validDate.getTime() < Date.now()) {
      throw new ConflictException('Coupon is expired');
    }

    if (coupon.quantity <= 0) {
      throw new ConflictException('Coupon is out of stock');
    }

    const claim = this.claimsRepository.create({
      userID: currentUser.sub,
      couponID: coupon.couponID,
      state: 0,
    });

    coupon.quantity -= 1;
    await this.couponRepository.save(coupon);

    return this.claimsRepository.save(claim);
  }

  async findAll(): Promise<Claim[]> {
    return this.claimsRepository.find({ relations: ['coupon'] });
  }

  async findMine(userID: string): Promise<Claim[]> {
    return this.claimsRepository.find({ where: { userID }, relations: ['coupon'] });
  }

  async findOne(couponID: string, currentUser: { sub: string; type: MemberType }, targetUserID?: string): Promise<Claim> {
    const where = targetUserID
      ? { couponID, userID: targetUserID }
      : { couponID, userID: currentUser.sub };
    const claim = await this.claimsRepository.findOne({
      where,
      relations: ['coupon'],
    });
    if (!claim) {
      throw new NotFoundException(`Claim for coupon ${couponID} not found`);
    }
    this.ensureCanAccess(claim, currentUser, targetUserID);
    return claim;
  }

  async update(
    couponID: string,
    updateClaimDto: UpdateClaimDto,
    currentUser: { sub: string; type: MemberType },
    targetUserID?: string,
  ): Promise<Claim> {
    const claim = await this.findOne(couponID, currentUser, targetUserID);

    if (updateClaimDto.state !== undefined) {
      claim.state = updateClaimDto.state;
      if (updateClaimDto.state === 1) {
        claim.usedAt = new Date();
      } else {
        claim.usedAt = null;
      }
    }

    return this.claimsRepository.save(claim);
  }

  async remove(couponID: string, currentUser: { sub: string; type: MemberType }, targetUserID?: string): Promise<void> {
    const claim = await this.findOne(couponID, currentUser, targetUserID);
    await this.claimsRepository.remove(claim);
  }

  private ensureCanAccess(claim: Claim, currentUser: { sub: string; type: MemberType }, targetUserID?: string): void {
    if (currentUser.type === MemberType.Admin) {
      return;
    }
    if (claim.userID !== currentUser.sub || (targetUserID && targetUserID !== currentUser.sub)) {
      throw new ForbiddenException('You can only access your own claims');
    }
  }

  private async ensureUserExists(userID: string): Promise<void> {
    const member = await this.memberRepository.findOne({ where: { memberID: userID } });
    if (!member) {
      throw new NotFoundException(`Member with ID ${userID} not found`);
    }
  }

  private async ensureCouponExists(couponID: string): Promise<void> {
    const coupon = await this.couponRepository.findOne({ where: { couponID } });
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${couponID} not found`);
    }
  }
}
