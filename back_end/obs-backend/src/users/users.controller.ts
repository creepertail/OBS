// src/users/users.controller.ts
import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  // 冒號代表參數
  /*
  GET /users
  POST /users
  GET /users/:id
  PATCH /users/:id
  */


  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findByID(@Param('id') id: string) {
    return this.usersService.findByID(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto:UpdateUserDto){
    return this.usersService.updateData(id, updateUserDto);
  }
}
