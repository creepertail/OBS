// src/restrict_user/restrict-user.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { RestrictUserService } from './restrict-user.service';
import { CreateRestrictUserDto } from './dto/create-restrict-user.dto';
import { UpdateRestrictUserDto } from './dto/update-restrict-user.dto';
import { JWTGuard } from '../member/decorators/jwt-guard.decorator';
import { CurrentUser } from '../member/decorators/current-user.decorator';
import { MemberType } from '../member/member-type.enum';

@Controller('restrict-user')
export class RestrictUserController {
  constructor(private readonly restrictUserService: RestrictUserService) {}

  @JWTGuard(MemberType.Admin)
  @Post()
  create(@Body() createDto: CreateRestrictUserDto, @CurrentUser() user: any) {
    return this.restrictUserService.create(createDto, user);
  }

  @JWTGuard(MemberType.Admin)
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.restrictUserService.findAll(user);
  }

  @JWTGuard(MemberType.Admin)
  @Get(':userID')
  findOne(@Param('userID') userID: string, @CurrentUser() user: any) {
    return this.restrictUserService.findOne(userID, user);
  }

  @JWTGuard(MemberType.Admin)
  @Patch(':userID')
  update(
    @Param('userID') userID: string,
    @Body() updateDto: UpdateRestrictUserDto,
    @CurrentUser() user: any,
  ) {
    return this.restrictUserService.update(userID, updateDto, user);
  }

  @JWTGuard(MemberType.Admin)
  @Delete(':userID')
  remove(@Param('userID') userID: string, @CurrentUser() user: any) {
    return this.restrictUserService.remove(userID, user);
  }
}

