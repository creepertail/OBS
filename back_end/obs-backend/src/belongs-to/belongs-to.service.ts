// src/belongs-to/belongs-to.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BelongsTo } from './entities/belongs-to.entity';
import { Book } from '../book/entities/book.entity';
import { Category } from '../category/entities/categories.entity';
import { CreateBelongsToDto } from './dto/create-belongs-to.dto';
import { MemberType } from '../member/member-type.enum';

@Injectable()
export class BelongsToService {
  constructor(
    @InjectRepository(BelongsTo)
    private belongsToRepository: Repository<BelongsTo>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) { }

  /**
   * 將書籍加入分類
   */
  async create(
    createBelongsToDto: CreateBelongsToDto,
    userId: string,
    userType: MemberType,
  ): Promise<BelongsTo> {
    const { bookID, categoryId } = createBelongsToDto;

    // 檢查書籍是否存在
    const book = await this.bookRepository.findOne({
      where: { bookID },
    });
    if (!book) {
      throw new NotFoundException(`Book with ID "${bookID}" not found`);
    }

    // 檢查權限：只有書籍的商家或 Admin 可以操作
    if (userType !== MemberType.Admin && book.merchantId !== userId) {
      throw new ForbiddenException(
        'Only the book owner or admin can add categories to this book',
      );
    }

    // 檢查分類是否存在
    const category = await this.categoryRepository.findOne({
      where: { categoryID: categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID "${categoryId}" not found`);
    }

    // 檢查是否已經存在此關聯
    const existing = await this.belongsToRepository.findOne({
      where: { bookID, categoryId },
    });
    if (existing) {
      throw new ConflictException(
        'This book is already assigned to this category',
      );
    }

    // 建立關聯
    const belongsTo = this.belongsToRepository.create({
      bookID,
      categoryId,
    });

    return await this.belongsToRepository.save(belongsTo);
  }

  /**
   * 將書籍從分類移除
   */
  async remove(
    bookID: string,
    categoryId: number,
    userId: string,
    userType: MemberType,
  ): Promise<void> {
    // 檢查書籍是否存在
    const book = await this.bookRepository.findOne({
      where: { bookID },
    });
    if (!book) {
      throw new NotFoundException(`Book with ID "${bookID}" not found`);
    }

    // 檢查權限：只有書籍的商家或 Admin 可以操作
    if (userType !== MemberType.Admin && book.merchantId !== userId) {
      throw new ForbiddenException(
        'Only the book owner or admin can remove categories from this book',
      );
    }

    // 檢查關聯是否存在
    const belongsTo = await this.belongsToRepository.findOne({
      where: { bookID, categoryId },
    });
    if (!belongsTo) {
      throw new NotFoundException(
        'This book is not assigned to this category',
      );
    }

    await this.belongsToRepository.remove(belongsTo);
  }

  /**
   * 查詢某本書的所有分類
   */
  async findCategoriesByBook(bookID: string): Promise<Category[]> {
    // 檢查書籍是否存在
    const book = await this.bookRepository.findOne({
      where: { bookID },
    });
    if (!book) {
      throw new NotFoundException(`Book with ID "${bookID}" not found`);
    }

    const belongsToList = await this.belongsToRepository.find({
      where: { bookID },
      relations: ['category'],
    });

    return belongsToList.map((bt) => bt.category);
  }

  /**
   * 查詢某分類下的所有書籍
   */
  async findBooksByCategory(categoryId: number): Promise<Book[]> {
    // 檢查分類是否存在
    const category = await this.categoryRepository.findOne({
      where: { categoryID: categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID "${categoryId}" not found`);
    }

    const belongsToList = await this.belongsToRepository.find({
      where: { categoryId },
      relations: ['book', 'book.images'],
    });

    return belongsToList.map((bt) => bt.book);
  }

  /**
   * 批次將書籍加入多個分類
   */
  async addBookToCategories(
    bookID: string,
    categoryIds: number[],
    userId: string,
    userType: MemberType,
  ): Promise<BelongsTo[]> {
    // 檢查書籍是否存在
    const book = await this.bookRepository.findOne({
      where: { bookID },
    });
    if (!book) {
      throw new NotFoundException(`Book with ID "${bookID}" not found`);
    }

    // 檢查權限
    if (userType !== MemberType.Admin && book.merchantId !== userId) {
      throw new ForbiddenException(
        'Only the book owner or admin can add categories to this book',
      );
    }

    const results: BelongsTo[] = [];

    for (const categoryId of categoryIds) {
      // 檢查分類是否存在
      const category = await this.categoryRepository.findOne({
        where: { categoryID: categoryId },
      });
      if (!category) {
        continue; // 跳過不存在的分類
      }

      // 檢查是否已存在
      const existing = await this.belongsToRepository.findOne({
        where: { bookID, categoryId },
      });
      if (existing) {
        continue; // 跳過已存在的關聯
      }

      const belongsTo = this.belongsToRepository.create({
        bookID,
        categoryId,
      });
      const saved = await this.belongsToRepository.save(belongsTo);
      results.push(saved);
    }

    return results;
  }

  /**
   * 取得所有書籍分類關聯
   */
  async findAll(): Promise<BelongsTo[]> {
    return await this.belongsToRepository.find({
      relations: ['book', 'category'],
    });
  }
}
