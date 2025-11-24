// src/book/books.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { Book } from './entityies/book.entity';
import { BookImage } from './entityies/book-image.entity';
import { Member } from '../member/entities/member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book, BookImage, Member])],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService],
})
export class BooksModule {}
