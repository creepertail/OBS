import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JWTGuard } from '../member/decorators/jwt-guard.decorator';
import { CurrentUser } from '../member/decorators/current-user.decorator';
import { MemberType } from '../member/member-type.enum';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // 新增評論：僅 User
  @JWTGuard(MemberType.User)
  @Post()
  create(@Body() createReviewDto: CreateReviewDto, @CurrentUser() user: any) {
    return this.reviewService.create(createReviewDto, user);
  }

  // 查詢某本書的所有評論（公開）
  @Get('book/:bookID')
  findByBook(@Param('bookID') bookID: string) {
    return this.reviewService.findByBook(bookID);
  }

  // 查詢自己的評論列表
  @JWTGuard(MemberType.User)
  @Get('mine')
  findMine(@CurrentUser() user: any) {
    return this.reviewService.findMine(user);
  }

  // 更新自己的評論（以 bookID 辨識）
  @JWTGuard(MemberType.User)
  @Patch(':bookID')
  update(
    @Param('bookID') bookID: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @CurrentUser() user: any,
  ) {
    return this.reviewService.update(bookID, updateReviewDto, user);
  }

  // 刪除自己的評論
  @JWTGuard(MemberType.User)
  @Delete(':bookID')
  remove(@Param('bookID') bookID: string, @CurrentUser() user: any) {
    return this.reviewService.remove(bookID, user);
  }
}
