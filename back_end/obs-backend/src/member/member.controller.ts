// src/member/member.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { LoginMemberDto } from './dto/login-member.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}
  
  // @url = http://localhost:3000
  /**
   * API 功能：
   *
   * GET url/members            => 所有member
   * GET url/members/:id        => 用id找member
   * GET url/members/:id/type   => 用id找member的type
   * POST url/members + body     => 新增member資料，並回傳member
   *   - email account password phoneNumber type              => member皆有，type = "admin" or "user" or "merchant"
   *   - username level                                       => type = "user" 會有的
   *   - merchantsName address => type = "merchant" 會有的    => type = "merchant" 會有的
   * 
   * POST url/members/login + body   => 登入member，回傳JWT access token和會員資料
   *   - body :
   *   - account password
   *
   * PATCH url/members/:id + body    => 用memberID找到member，修改其資料，並回傳member
   * Authorization: Bearer {{access_token}}
   *  - body :
   *   - "membertype" is necessary
   *   - email account password phoneNumber
   *   - username level userState (when membertype is user)
   *   - merchantsName merchantsState address subscriberCount(when membertype is merchant)
   *
   * DELETE url/members/:id     => 刪掉某id member
   */


  // POST url/members/login
  @Post('login')
  login(@Body() loginMemberDto: LoginMemberDto) {
    return this.memberService.login(loginMemberDto);
  }

  // GET url/members
  @Get()
  findAll() {
    return this.memberService.findAll();
  }
  
  // GET url/members/:id
  @Get(':id')
  findByID(@Param('id') id: string) {
    return this.memberService.findByID(id);
  }
  
  // GET url/members/:id/type
  @Get(':id/type')
  findMemberType(@Param('id') id: string) {
    return this.memberService.findMemberType(id);
  }
  
  // POST url/members + body
  @Post()
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.memberService.create(createMemberDto);
  }
  
  // PATCH url/members/:id + body
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) {
    return this.memberService.update(id, updateMemberDto);
  }

  // DELETE url/members/:id
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.memberService.remove(id);
  }
}

