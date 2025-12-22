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
    const targetUserID = this.resolveTargetUser(createClaimDto.userID, currentUser);

    await this.ensureUserExists(targetUserID);
    await this.ensureCouponExists(createClaimDto.couponID);

    const existing = await this.claimsRepository.findOne({
      where: { userID: targetUserID, couponID: createClaimDto.couponID },
    });
    if (existing) {
      throw new ConflictException('Claim already exists for this user and coupon');
    }

    const claim = this.claimsRepository.create({
      userID: targetUserID,
      couponID: createClaimDto.couponID,
      remaining: createClaimDto.remaining,
    });
    return this.claimsRepository.save(claim);
  }

  async findAll(): Promise<Claim[]> {
    return this.claimsRepository.find();
  }

  async findMine(userID: string): Promise<Claim[]> {
    return this.claimsRepository.find({ where: { userID } });
  }

  async findOne(couponID: string, currentUser: { sub: string; type: MemberType }, userID?: string): Promise<Claim> {
    const targetUserID = this.resolveTargetUser(userID, currentUser);
    const claim = await this.claimsRepository.findOne({
      where: { userID: targetUserID, couponID },
    });
    if (!claim) {
      throw new NotFoundException(`Claim not found for user ${targetUserID} and coupon ${couponID}`);
    }
    this.ensureCanAccess(claim, currentUser);
    return claim;
  }

  async update(
    couponID: string,
    updateClaimDto: UpdateClaimDto,
    currentUser: { sub: string; type: MemberType },
    userID?: string,
  ): Promise<Claim> {
    const claim = await this.findOne(couponID, currentUser, userID);

    if (updateClaimDto.remaining !== undefined) {
      claim.remaining = updateClaimDto.remaining;
    }

    return this.claimsRepository.save(claim);
  }

  async remove(couponID: string, currentUser: { sub: string; type: MemberType }, userID?: string): Promise<void> {
    const claim = await this.findOne(couponID, currentUser, userID);
    await this.claimsRepository.remove(claim);
  }

  private resolveTargetUser(userID: string | undefined, currentUser: { sub: string; type: MemberType }): string {
    if (currentUser.type === MemberType.Admin) {
      if (!userID) {
        throw new ForbiddenException('Admin must specify userID when creating or managing claims');
      }
      return userID;
    }

    if (currentUser.type === MemberType.User) {
      if (userID && userID !== currentUser.sub) {
        throw new ForbiddenException('You can only manage your own claims');
      }
      return currentUser.sub;
    }

    throw new ForbiddenException('Only admin or user can manage claims');
  }

  private ensureCanAccess(claim: Claim, currentUser: { sub: string; type: MemberType }): void {
    if (currentUser.type === MemberType.Admin) {
      return;
    }
    if (claim.userID !== currentUser.sub) {
      throw new ForbiddenException('You can only access your own claims');
    }
  }

  private async ensureUserExists(userID: string): Promise<void> {
    const member = await this.memberRepository.findOne({ where: { memberID: userID } });
    if (!member) {
      throw new NotFoundException(`Member with ID ${userID} not found`);
    }
    if (member.type !== MemberType.User) {
      throw new ForbiddenException('Claims can only be created for users');
    }
  }

  private async ensureCouponExists(couponID: string): Promise<void> {
    const coupon = await this.couponRepository.findOne({ where: { couponID } });
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${couponID} not found`);
    }
  }
}

