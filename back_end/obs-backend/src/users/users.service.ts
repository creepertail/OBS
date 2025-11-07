// src/users/users.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entityies/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // 檢查 email 是否已存在
    const existingUserByEmail = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUserByEmail) {
      throw new ConflictException('Email already exists');
    }

    // 檢查 account 是否已存在
    const existingUserByAccount = await this.usersRepository.findOne({
      where: { account: createUserDto.account },
    });
    if (existingUserByAccount) {
      throw new ConflictException('Account already exists');
    }

    // 檢查 phone 是否已存在
    const existingUserByPhone = await this.usersRepository.findOne({
      where: { phone: createUserDto.phone },
    });
    if (existingUserByPhone) {
      throw new ConflictException('Phone number already exists');
    }

    // 加密密碼
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // 建立新用戶
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  // 用 ID 找尋 user
  async findByID(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { user_id: id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
}
