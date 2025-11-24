// src/category/category.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../member/guards/jwt-auth.guard';
import { AdminGuard } from '../member/guards/admin.guard';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * POST /categories
   * 建立新分類（僅限 Admin）
   */
  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body(new ValidationPipe()) createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  /**
   * GET /categories
   * 取得所有分類
   */
  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  /**
   * GET /categories/statistics
   * 取得分類統計資訊（用於類別分析）
   */
  @Get('statistics')
  getStatistics() {
    return this.categoryService.getStatistics();
  }

  /**
   * GET /categories/search?name=xxx
   * 根據名稱搜尋分類
   */
  @Get('search')
  searchByName(@Query('name') name: string) {
    return this.categoryService.searchByName(name || '');
  }

  /**
   * GET /categories/:id
   * 根據 ID 取得單一分類
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findOne(id);
  }

  /**
   * PATCH /categories/:id
   * 更新分類（僅限 Admin）
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  /**
   * DELETE /categories/:id
   * 刪除分類（僅限 Admin）
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.remove(id);
  }
}
