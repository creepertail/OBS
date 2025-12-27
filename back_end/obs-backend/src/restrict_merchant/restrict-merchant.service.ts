// src/restrict_merchant/restrict-merchant.service.ts
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestrictMerchant } from './entities/restrict-merchant.entity';
import { CreateRestrictMerchantDto } from './dto/create-restrict-merchant.dto';
import { UpdateRestrictMerchantDto } from './dto/update-restrict-merchant.dto';
import { Member } from '../member/entities/member.entity';
import { MemberType } from '../member/member-type.enum';

@Injectable()
export class RestrictMerchantService {
  constructor(
    @InjectRepository(RestrictMerchant)
    private readonly restrictMerchantRepository: Repository<RestrictMerchant>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  async create(createDto: CreateRestrictMerchantDto, currentUser: { sub: string; type: MemberType }): Promise<RestrictMerchant> {
    this.ensureAdmin(currentUser);
    await this.ensureMerchantExists(createDto.merchantID);

    const record = this.restrictMerchantRepository.create({
      adminID: currentUser.sub,
      merchantID: createDto.merchantID,
      originalState: createDto.originalState,
      latestState: createDto.latestState,
    });
    return this.restrictMerchantRepository.save(record);
  }

  async findAll(currentUser: { sub: string; type: MemberType }): Promise<RestrictMerchant[]> {
    this.ensureAdmin(currentUser);
    return this.restrictMerchantRepository.find();
  }

  async findOne(merchantID: string, currentUser: { sub: string; type: MemberType }): Promise<RestrictMerchant> {
    this.ensureAdmin(currentUser);
    const record = await this.restrictMerchantRepository.findOne({ where: { merchantID } });
    if (!record) {
      throw new NotFoundException(`RestrictMerchant for merchant ${merchantID} not found`);
    }
    return record;
  }

  async update(
    merchantID: string,
    updateDto: UpdateRestrictMerchantDto,
    currentUser: { sub: string; type: MemberType },
  ): Promise<RestrictMerchant> {
    const record = await this.findOne(merchantID, currentUser);
    Object.assign(record, updateDto, { adminID: currentUser.sub });
    return this.restrictMerchantRepository.save(record);
  }

  async remove(merchantID: string, currentUser: { sub: string; type: MemberType }): Promise<void> {
    const record = await this.findOne(merchantID, currentUser);
    await this.restrictMerchantRepository.remove(record);
  }

  private ensureAdmin(user: { type: MemberType }): void {
    if (user.type !== MemberType.Admin) {
      throw new ForbiddenException('Only admin can manage restrict_merchant');
    }
  }

  private async ensureMerchantExists(merchantID: string): Promise<void> {
    const member = await this.memberRepository.findOne({ where: { memberID: merchantID } });
    if (!member) {
      throw new NotFoundException(`Merchant with ID ${merchantID} not found`);
    }
    if (member.type !== MemberType.Merchant) {
      throw new ForbiddenException('Target member is not a merchant');
    }
  }
}

