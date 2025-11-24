// src/category/category.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/categories.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  /**
   * 建立新分類
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // 檢查分類名稱是否已存在
    const existingCategory = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name },
    });

    if (existingCategory) {
      throw new ConflictException(
        `Category with name "${createCategoryDto.name}" already exists`,
      );
    }

    const category = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  /**
   * 取得所有分類
   */
  async findAll(): Promise<Category[]> {
    return await this.categoryRepository.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * 根據 ID 取得單一分類
   */
  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { categoryID: id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    return category;
  }

  /**
   * 根據名稱搜尋分類（支援模糊搜尋）
   */
  async searchByName(name: string): Promise<Category[]> {
    return await this.categoryRepository
      .createQueryBuilder('category')
      .where('category.name LIKE :name', { name: `%${name}%` })
      .orderBy('category.name', 'ASC')
      .getMany();
  }

  /**
   * 更新分類
   */
  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);

    // 如果要更新名稱，檢查是否與其他分類重複
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { name: updateCategoryDto.name },
      });

      if (existingCategory) {
        throw new ConflictException(
          `Category with name "${updateCategoryDto.name}" already exists`,
        );
      }
    }

    Object.assign(category, updateCategoryDto);
    return await this.categoryRepository.save(category);
  }

  /**
   * 刪除分類
   */
  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
  }

  /**
   * 取得分類統計資訊（可用於類別分析）
   */
  async getStatistics(): Promise<{
    totalCategories: number;
    categories: { categoryID: number; name: string; bookCount: number }[];
  }> {
    const totalCategories = await this.categoryRepository.count();

    // 取得每個分類的書籍數量
    const categoriesWithCount = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoin('belong_to', 'bt', 'bt.categoryId = category.categoryID')
      .select('category.categoryID', 'categoryID')
      .addSelect('category.name', 'name')
      .addSelect('COUNT(bt.bookID)', 'bookCount')
      .groupBy('category.categoryID')
      .addGroupBy('category.name')
      .orderBy('bookCount', 'DESC')
      .getRawMany();

    return {
      totalCategories,
      categories: categoriesWithCount.map((c) => ({
        categoryID: c.categoryID,
        name: c.name,
        bookCount: parseInt(c.bookCount) || 0,
      })),
    };
  }
}
