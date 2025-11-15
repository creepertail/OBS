// src/member/member.service.ts
import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { LoginMemberDto } from './dto/login-member.dto';
import { Member } from './entities/member.entity';
import { MemberType } from './member-type.enum';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    private readonly jwtService: JwtService,
  ) {}

  findAll(): Promise<Member[]> {
    return this.memberRepository.find();
  }

  async findByID(id: string): Promise<Member> {
    const member = await this.memberRepository.findOne({ where: { member_id: id } });
    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }
    return member;
  }

  async findMemberType(id: string): Promise<MemberType> {
    const member = await this.findByID(id);
    return member.type;
  }

  async create(createMemberDto: CreateMemberDto): Promise<Member> {
    await this.ensureUniqueFields(createMemberDto);

    const member = this.memberRepository.create({
      ...createMemberDto,
      password: await bcrypt.hash(createMemberDto.password, 10),
    });

    return this.memberRepository.save(member);
  }

  // id 為 被改動的人
  // sub 為 發這個API的Member 的 ID
  async update(id: string, updateMemberDto: UpdateMemberDto, user: { sub: string; type: MemberType; account: string }): Promise<Member> {
    const member = await this.findByID(id);

    // 權限檢查：非 Admin 用戶只能修改自己的資料
    if (user.type !== MemberType.Admin && user.sub !== id) {
      throw new ForbiddenException('You do not have permission to modify this member');
    }

    // 根據目標會員的類型進行欄位驗證（防止修改不屬於該類型的欄位）
    if (member.type === MemberType.Admin) {
      if (updateMemberDto.username !== undefined) {
        throw new ConflictException('Since the type is Admin, the Username cannot be modified.');
      }
      if (updateMemberDto.level !== undefined) {
        throw new ConflictException('Since the type is Admin, the Level cannot be modified.');
      }
      if (updateMemberDto.userState !== undefined) {
        throw new ConflictException('Since the type is Admin, the UserState cannot be modified.');
      }
      if (updateMemberDto.merchantName !== undefined) {
        throw new ConflictException('Since the type is Admin, the MerchantName cannot be modified.');
      }
      if (updateMemberDto.merchantState !== undefined) {
        throw new ConflictException('Since the type is Admin, the MerchantState cannot be modified.');
      }
      if (updateMemberDto.merchantAddress !== undefined) {
        throw new ConflictException('Since the type is Admin, the Address cannot be modified.');
      }
      if (updateMemberDto.merchantSubscriberCount !== undefined) {
        throw new ConflictException('Since the type is Admin, the SubscriberCount cannot be modified.');
      }
    }

    if (member.type === MemberType.User) {
      if (updateMemberDto.merchantName !== undefined) {
        throw new ConflictException('Since the type is User, the MerchantName cannot be modified.');
      }
      if (updateMemberDto.merchantState !== undefined) {
        throw new ConflictException('Since the type is User, the MerchantState cannot be modified.');
      }
      if (updateMemberDto.merchantAddress !== undefined) {
        throw new ConflictException('Since the type is User, the Address cannot be modified.');
      }
      if (updateMemberDto.merchantSubscriberCount !== undefined) {
        throw new ConflictException('Since the type is User, the SubscriberCount cannot be modified.');
      }
    }

    if (member.type === MemberType.Merchant) {
      if (updateMemberDto.username !== undefined) {
        throw new ConflictException('Since the type is Merchant, the Username cannot be modified.');
      }
      if (updateMemberDto.level !== undefined) {
        throw new ConflictException('Since the type is Merchant, the Level cannot be modified.');
      }
      if (updateMemberDto.userState !== undefined) {
        throw new ConflictException('Since the type is Merchant, the UserState cannot be modified.');
      }
    }

    await this.ensureUniqueFields(updateMemberDto, member.member_id);

    if (updateMemberDto.password) {
      updateMemberDto.password = await bcrypt.hash(updateMemberDto.password, 10);
    }

    Object.assign(member, updateMemberDto);
    return this.memberRepository.save(member);
  }

  async remove(id: string): Promise<void> {
    await this.findByID(id);
    await this.memberRepository.delete({ member_id: id });
  }

  async login(loginMemberDto: LoginMemberDto): Promise<{ access_token: string; member: Omit<Member, 'password'> }> {
    const { account, password } = loginMemberDto;

    // 使用 account 找到會員
    const member = await this.memberRepository.findOne({ where: { account } });

    if (!member) {
      throw new UnauthorizedException('Invalid account or password');
    }

    // 驗證密碼
    const isPasswordValid = await bcrypt.compare(password, member.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid account or password');
    }

    // 生成 JWT token
    const payload = {
      sub: member.member_id,
      account: member.account,
      type: member.type,
    };

    const access_token = await this.jwtService.signAsync(payload);

    // 回傳 token 和會員資料（不包含密碼）
    const { password: _, ...memberWithoutPassword } = member;

    return {
      access_token,
      member: memberWithoutPassword,
    };
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

    if (dto.phoneNumber && dto.type != MemberType.Admin) {
      const existingByPhone = await this.memberRepository.findOne({ where: { phoneNumber: dto.phoneNumber } });
      if (existingByPhone && existingByPhone.member_id !== currentId) {
        throw new ConflictException('Phone number already exists');
      }
    }
    
    if(dto.type === MemberType.Merchant){
      const existingByMerchantName = await this.memberRepository.findOne({where: { type: MemberType.Merchant, merchantName: dto.merchantName }});
      if(existingByMerchantName && existingByMerchantName.member_id !== currentId){
        throw new ConflictException('Merchant name already exists');
      }
    }
  }
}
