// src/belongs-to/belongs-to.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BelongsToService } from './belongs-to.service';
import { CreateBelongsToDto } from './dto/create-belongs-to.dto';
import { JwtAuthGuard } from '../member/guards/jwt-auth.guard';

@Controller('belongs-to')
export class BelongsToController {
  constructor(private readonly belongsToService: BelongsToService) {}

  /**
   * POST /belongs-to
   * 將書籍加入分類（需要認證，僅書籍擁有者或 Admin）
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body(new ValidationPipe()) createBelongsToDto: CreateBelongsToDto,
    @Request() req,
  ) {
    const userId = req.user.sub;
    const userType = req.user.type;
    return this.belongsToService.create(createBelongsToDto, userId, userType);
  }

  /**
   * POST /belongs-to/batch
   * 批次將書籍加入多個分類（需要認證，僅書籍擁有者或 Admin）
   */
  @Post('batch')
  @UseGuards(JwtAuthGuard)
  addBookToCategories(
    @Body('bookID', ParseUUIDPipe) bookID: string,
    @Body('categoryIds') categoryIds: number[],
    @Request() req,
  ) {
    const userId = req.user.sub;
    const userType = req.user.type;
    return this.belongsToService.addBookToCategories(
      bookID,
      categoryIds,
      userId,
      userType,
    );
  }

  /**
   * GET /belongs-to
   * 取得所有書籍分類關聯
   */
  @Get()
  findAll() {
    return this.belongsToService.findAll();
  }

  /**
   * GET /belongs-to/book/:bookId
   * 查詢某本書的所有分類
   */
  @Get('book/:bookId')
  findCategoriesByBook(@Param('bookId', ParseUUIDPipe) bookId: string) {
    return this.belongsToService.findCategoriesByBook(bookId);
  }

  /**
   * GET /belongs-to/category/:categoryId
   * 查詢某分類下的所有書籍
   */
  @Get('category/:categoryId')
  findBooksByCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.belongsToService.findBooksByCategory(categoryId);
  }

  /**
   * DELETE /belongs-to
   * 將書籍從分類移除（需要認證，僅書籍擁有者或 Admin）
   */
  @Delete()
  @UseGuards(JwtAuthGuard)
  remove(
    @Query('bookID', ParseUUIDPipe) bookID: string,
    @Query('categoryId', ParseIntPipe) categoryId: number,
    @Request() req,
  ) {
    const userId = req.user.sub;
    const userType = req.user.type;
    return this.belongsToService.remove(bookID, categoryId, userId, userType);
  }
}
