// src/member/member.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { Member } from './member.entity';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  async create(createMemberDto: CreateMemberDto): Promise<Member> {
    await this.ensureUniqueFields(createMemberDto);

    const member = this.memberRepository.create({
      ...createMemberDto,
      password: await bcrypt.hash(createMemberDto.password, 10),
    });

    return this.memberRepository.save(member);
  }

  findAll(): Promise<Member[]> {
    return this.memberRepository.find();
  }

  async findOne(id: string): Promise<Member> {
    const member = await this.memberRepository.findOne({ where: { member_id: id } });
    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }
    return member;
  }

  async update(id: string, updateMemberDto: UpdateMemberDto): Promise<Member> {
    const member = await this.findOne(id);

    await this.ensureUniqueFields(updateMemberDto, member.member_id);

    if (updateMemberDto.password) {
      updateMemberDto.password = await bcrypt.hash(updateMemberDto.password, 10);
    }

    Object.assign(member, updateMemberDto);
    return this.memberRepository.save(member);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.memberRepository.delete(id);
  }

  private async ensureUniqueFields(
    dto: Partial<CreateMemberDto | UpdateMemberDto>,
    currentId?: string,
  ): Promise<void> {
    if (dto.email) {
      const existingByEmail = await this.memberRepository.findOne({ where: { email: dto.email } });
      if (existingByEmail && existingByEmail.member_id !== currentId) {
        throw new ConflictException('Email already exists');
      }
    }

    if (dto.account) {
      const existingByAccount = await this.memberRepository.findOne({ where: { account: dto.account } });
      if (existingByAccount && existingByAccount.member_id !== currentId) {
        throw new ConflictException('Account already exists');
      }
    }

    if (dto.phoneNumber) {
      const existingByPhone = await this.memberRepository.findOne({ where: { phoneNumber: dto.phoneNumber } });
      if (existingByPhone && existingByPhone.member_id !== currentId) {
        throw new ConflictException('Phone number already exists');
      }
    }
  }
}

