// src/restrict_user/restrict-user.service.ts
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestrictUser } from './entities/restrict-user.entity';
import { CreateRestrictUserDto } from './dto/create-restrict-user.dto';
import { UpdateRestrictUserDto } from './dto/update-restrict-user.dto';
import { Member } from '../member/entities/member.entity';
import { MemberType } from '../member/member-type.enum';

@Injectable()
export class RestrictUserService {
  constructor(
    @InjectRepository(RestrictUser)
    private readonly restrictUserRepository: Repository<RestrictUser>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  async create(createDto: CreateRestrictUserDto, currentUser: { sub: string; type: MemberType }): Promise<RestrictUser> {
    this.ensureAdmin(currentUser);
    await this.ensureUserExists(createDto.userID);

    const record = this.restrictUserRepository.create({
      adminID: currentUser.sub,
      userID: createDto.userID,
      originalState: createDto.originalState,
      latestState: createDto.latestState,
    });
    return this.restrictUserRepository.save(record);
  }

  async findAll(currentUser: { sub: string; type: MemberType }): Promise<RestrictUser[]> {
    this.ensureAdmin(currentUser);
    return this.restrictUserRepository.find();
  }

  async findOne(
    userID: string,
    currentUser: { sub: string; type: MemberType },
  ): Promise<RestrictUser | { exists: false; message: string }> {
    this.ensureAdmin(currentUser);
    const record = await this.restrictUserRepository.findOne({ where: { userID } });
    if (!record) {
      return { exists: false, message: `No restriction record for user ${userID}` };
    }
    return record;
  }

  async update(
    userID: string,
    updateDto: UpdateRestrictUserDto,
    currentUser: { sub: string; type: MemberType },
  ): Promise<RestrictUser> {
    const record = await this.findExisting(userID, currentUser);
    Object.assign(record, updateDto, { adminID: currentUser.sub });
    return this.restrictUserRepository.save(record);
  }

  async remove(userID: string, currentUser: { sub: string; type: MemberType }): Promise<void> {
    const record = await this.findExisting(userID, currentUser);
    await this.restrictUserRepository.remove(record);
  }

  private ensureAdmin(user: { type: MemberType }): void {
    if (user.type !== MemberType.Admin) {
      throw new ForbiddenException('Only admin can manage restrict_user');
    }
  }

  private async ensureUserExists(userID: string): Promise<void> {
    const member = await this.memberRepository.findOne({ where: { memberID: userID } });
    if (!member) {
      throw new NotFoundException(`User with ID ${userID} not found`);
    }
    if (member.type !== MemberType.User) {
      throw new ForbiddenException('Target member is not a user');
    }
  }

  private async findExisting(userID: string, currentUser: { sub: string; type: MemberType }): Promise<RestrictUser> {
    this.ensureAdmin(currentUser);
    const record = await this.restrictUserRepository.findOne({ where: { userID } });
    if (!record) {
      throw new NotFoundException(`RestrictUser for user ${userID} not found`);
    }
    return record;
  }
}
