import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { FavoriteService } from './favorite.service';
import { FavoriteController } from './favorite.controller';
import { Member } from '../member/entities/member.entity';
import { Book } from '../book/entities/book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, Member, Book])],
  controllers: [FavoriteController],
  providers: [FavoriteService],
})
export class FavoriteModule {}
