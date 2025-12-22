// src/restrict_merchant/restrict-merchant.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { RestrictMerchantService } from './restrict-merchant.service';
import { CreateRestrictMerchantDto } from './dto/create-restrict-merchant.dto';
import { UpdateRestrictMerchantDto } from './dto/update-restrict-merchant.dto';
import { JWTGuard } from '../member/decorators/jwt-guard.decorator';
import { CurrentUser } from '../member/decorators/current-user.decorator';
import { MemberType } from '../member/member-type.enum';

@Controller('restrict-merchant')
export class RestrictMerchantController {
  constructor(private readonly restrictMerchantService: RestrictMerchantService) {}

  @JWTGuard(MemberType.Admin)
  @Post()
  create(@Body() createDto: CreateRestrictMerchantDto, @CurrentUser() user: any) {
    return this.restrictMerchantService.create(createDto, user);
  }

  @JWTGuard(MemberType.Admin)
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.restrictMerchantService.findAll(user);
  }

  @JWTGuard(MemberType.Admin)
  @Get(':merchantID')
  findOne(@Param('merchantID') merchantID: string, @CurrentUser() user: any) {
    return this.restrictMerchantService.findOne(merchantID, user);
  }

  @JWTGuard(MemberType.Admin)
  @Patch(':merchantID')
  update(
    @Param('merchantID') merchantID: string,
    @Body() updateDto: UpdateRestrictMerchantDto,
    @CurrentUser() user: any,
  ) {
    return this.restrictMerchantService.update(merchantID, updateDto, user);
  }

  @JWTGuard(MemberType.Admin)
  @Delete(':merchantID')
  remove(@Param('merchantID') merchantID: string, @CurrentUser() user: any) {
    return this.restrictMerchantService.remove(merchantID, user);
  }
}

