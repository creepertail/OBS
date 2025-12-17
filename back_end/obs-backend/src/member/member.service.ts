// src/member/member.service.ts
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { LoginMemberDto } from './dto/login-member.dto';
import { Member } from './entities/member.entity';
import { Subscribes } from '../subscription/entities/subscribes.entity';
import { MemberType } from './member-type.enum';
import { Book } from '../book/entities/book.entity';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Subscribes)
    private readonly subscribesRepository: Repository<Subscribes>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    private readonly jwtService: JwtService,
  ) { }

  findAll(): Promise<Member[]> {
    return this.memberRepository.find();
  }

  async findByID(id: string): Promise<Member> {
    const member = await this.memberRepository.findOne({ where: { memberID: id } });
    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    // 若是 Merchant，則更新訂閱者數量
    if (member.type === MemberType.Merchant) {
      const subscriberCount = await this.subscribesRepository.count({
        where: { merchantID: id },
      });
      if (member.merchantSubscriberCount !== subscriberCount) {
        member.merchantSubscriberCount = subscriberCount;
        await this.memberRepository.save(member);
      }
    }

    return member;
  }

  async findBookByMerchantID(id: string): Promise<Member & { books: Book[] }> {
    const member = await this.memberRepository.findOne({ where: { memberID: id } });
    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }
    if (member.type === MemberType.Merchant) {
      const subscriberCount = await this.subscribesRepository.count({
        where: { merchantID: id },
      });
      if (member.merchantSubscriberCount !== subscriberCount) {
        member.merchantSubscriberCount = subscriberCount;
        await this.memberRepository.save(member);
      }
    }
    const books = await this.bookRepository.find({
      where: { merchantId: id },
      relations: ['images']
    });

    return { ...member, books };
  }

  async findMemberType(id: string): Promise<MemberType> {
    const member = await this.findByID(id);
    return member.type;
  }

  async create(createMemberDto: CreateMemberDto): Promise<Member> {
    // 驗證共用必填欄位
    this.validateRequiredFields(createMemberDto);

    await this.ensureUniqueFields(createMemberDto);

    const member = this.memberRepository.create({
      ...createMemberDto,
      password: await bcrypt.hash(createMemberDto.password, 10),
    });

    return this.memberRepository.save(member);
  }

  private validateRequiredFields(dto: CreateMemberDto): void {
    // 共用必填欄位驗證
    if (!dto.email || dto.email.trim() === '') {
      throw new BadRequestException('Email is required');
    }
    if (!dto.account || dto.account.trim() === '') {
      throw new BadRequestException('Account is required');
    }
    if (!dto.password || dto.password.trim() === '') {
      throw new BadRequestException('Password is required');
    }
    if (!dto.phoneNumber || dto.phoneNumber.trim() === '') {
      throw new BadRequestException('Phone number is required');
    }
    if (!dto.type) {
      throw new BadRequestException('Member type is required');
    }

    // 根據會員類型驗證特定欄位
    if (dto.type === MemberType.User) {
      if (!dto.userName || dto.userName.trim() === '') {
        throw new BadRequestException('User name is required for User type');
      }
    }

    if (dto.type === MemberType.Merchant) {
      if (!dto.merchantName || dto.merchantName.trim() === '') {
        throw new BadRequestException('Merchant name is required for Merchant type');
      }
      if (!dto.merchantAddress || dto.merchantAddress.trim() === '') {
        throw new BadRequestException('Merchant address is required for Merchant type');
      }
    }
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
      if (updateMemberDto.userName !== undefined) {
        throw new ConflictException('Since the type is Admin, the UserName cannot be modified.');
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
      if (updateMemberDto.userName !== undefined) {
        throw new ConflictException('Since the type is Merchant, the UserName cannot be modified.');
      }
      if (updateMemberDto.level !== undefined) {
        throw new ConflictException('Since the type is Merchant, the Level cannot be modified.');
      }
      if (updateMemberDto.userState !== undefined) {
        throw new ConflictException('Since the type is Merchant, the UserState cannot be modified.');
      }
    }

    await this.ensureUniqueFields(updateMemberDto, member.memberID);

    if (updateMemberDto.password) {
      updateMemberDto.password = await bcrypt.hash(updateMemberDto.password, 10);
    }

    Object.assign(member, updateMemberDto);
    return this.memberRepository.save(member);
  }

  async remove(id: string): Promise<void> {
    await this.findByID(id);
    await this.memberRepository.delete({ memberID: id });
  }

  async login(loginMemberDto: LoginMemberDto): Promise<{ access_token: string }> {
    const { account, password } = loginMemberDto;

    // 使用 account 找到會員，並額外選取 password 欄位
    const member = await this.memberRepository.createQueryBuilder('member')
      .where('member.account = :account', { account })
      .addSelect('member.password')
      .getOne();

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
      sub: member.memberID,
      account: member.account,
      type: member.type,
    };

    const access_token = await this.jwtService.signAsync(payload);

    // 回傳 token 

    return {
      access_token
    };
  }

  private async ensureUniqueFields(
    dto: Partial<CreateMemberDto | UpdateMemberDto>,
    currentId?: string,
  ): Promise<void> {
    if (dto.email) {
      const existingByEmail = await this.memberRepository.findOne({ where: { email: dto.email } });
      if (existingByEmail && existingByEmail.memberID !== currentId) {
        throw new ConflictException('Email already exists');
      }
    }

    if (dto.account) {
      const existingByAccount = await this.memberRepository.findOne({ where: { account: dto.account } });
      if (existingByAccount && existingByAccount.memberID !== currentId) {
        throw new ConflictException('Account already exists');
      }
    }

    if (dto.phoneNumber && dto.type != MemberType.Admin) {
      const existingByPhone = await this.memberRepository.findOne({ where: { phoneNumber: dto.phoneNumber } });
      if (existingByPhone && existingByPhone.memberID !== currentId) {
        throw new ConflictException('Phone number already exists');
      }
    }

    if (dto.type === MemberType.Merchant) {
      const existingByMerchantName = await this.memberRepository.findOne({ where: { type: MemberType.Merchant, merchantName: dto.merchantName } });
      if (existingByMerchantName && existingByMerchantName.memberID !== currentId) {
        throw new ConflictException('Merchant name already exists');
      }
    }
  }
}
