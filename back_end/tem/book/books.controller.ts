// src/book/books.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  /**
   * POST /books - 建立新書籍
   */
  @Post()
  create(@Body(new ValidationPipe()) createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  /**
   * GET /books - 查詢所有書籍
   */
  @Get()
  findAll() {
    return this.booksService.findAll();
  }

  /**
   * GET /books/:id - 根據 ID 查詢書籍
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findByID(id);
  }

  /**
   * GET /books/isbn/:isbn - 根據 ISBN 查詢書籍
   */
  @Get('isbn/:isbn')
  findByISBN(@Param('isbn') isbn: string) {
    return this.booksService.findByISBN(isbn);
  }

  /**
   * PATCH /books/:id - 更新書籍資訊
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateBookDto: UpdateBookDto
  ) {
    return this.booksService.update(id, updateBookDto);
  }

  /**
   * PATCH /books/:id/status - 更新書籍狀態
   */
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: number
  ) {
    return this.booksService.updateStatus(id, status);
  }

  /**
   * DELETE /books/:id - 刪除書籍
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.booksService.remove(id);
  }

  /**
   * POST /books/:id/images - 新增書籍圖片
   */
  @Post(':id/images')
  addImage(
    @Param('id') id: string,
    @Body('imageUrl') imageUrl: string,
    @Body('displayOrder') displayOrder: number,
    @Body('isCover') isCover: boolean
  ) {
    return this.booksService.addImage(id, imageUrl, displayOrder, isCover);
  }

  /**
   * DELETE /books/images/:imageId - 刪除書籍圖片
   */
  @Delete('images/:imageId')
  removeImage(@Param('imageId') imageId: string) {
    return this.booksService.removeImage(imageId);
  }
}
