// src/users/users.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entityies/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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

  // 修改User的資料
  async updateData(id: string, updateUserDto: UpdateUserDto): Promise<User>{
    const user = await this.findByID(id);
    // email 有沒有跟別人重複
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUserByEmail = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUserByEmail) {
        throw new ConflictException('Email already exists');
      }
    }
    // account 有沒有跟別人重複
    if(updateUserDto.account && updateUserDto.account !== user.account){
      const existingUserByAccount = await this.usersRepository.findOne({
        where: { account: updateUserDto.account },
      });
      if (existingUserByAccount) {
        throw new ConflictException('Account already exists');
      }
    }
    // username 有沒有跟別人重複
    if(updateUserDto.username && updateUserDto.username !== user.username){
      const existingUserByUsename = await this.usersRepository.findOne({
        where: { username: updateUserDto.username },
      });
      if (existingUserByUsename) {
        throw new ConflictException('Username already exists');
      }
    }
    // phone 有沒有跟別人重複
    if (updateUserDto.phone && updateUserDto.phone !== user.phone) {
      const existingUserByPhone = await this.usersRepository.findOne({
        where: { phone: updateUserDto.phone },
      });
      if (existingUserByPhone) {
        throw new ConflictException('Phone number already exists');
      }
    }
    // 處理密碼加密（如果要更新密碼）
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);

    return await this.usersRepository.save(user);
  }
}
