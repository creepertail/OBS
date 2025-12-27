import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { JWTGuard } from '../member/decorators/jwt-guard.decorator';
import { CurrentUser } from '../member/decorators/current-user.decorator';
import { MemberType } from '../member/member-type.enum';

@Controller('favorites')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @JWTGuard(MemberType.User)
  @Post()
  create(@Body() createFavoriteDto: CreateFavoriteDto, @CurrentUser() user: any) {
    return this.favoriteService.create(createFavoriteDto, user);
  }

  @JWTGuard(MemberType.User)
  @Get('mine')
  findMine(@CurrentUser() user: any) {
    return this.favoriteService.findMine(user);
  }

  @JWTGuard(MemberType.User)
  @Delete(':bookID')
  remove(@Param('bookID') bookID: string, @CurrentUser() user: any) {
    return this.favoriteService.remove(bookID, user);
  }
}
