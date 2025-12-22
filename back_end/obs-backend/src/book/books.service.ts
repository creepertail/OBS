// src/book/books.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Book } from './entities/book.entity';
import { BookImage } from './entities/book-image.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Member } from '../member/entities/member.entity';
import { MemberType } from '../member/member-type.enum';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
    @InjectRepository(BookImage)
    private bookImagesRepository: Repository<BookImage>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) { }

  /**
   * 建立新書籍（包含圖片）
   */
  async create(createBookDto: CreateBookDto, merchantId: string): Promise<Book> {
    // 驗證價格和庫存
    if (createBookDto.price <= 0) {
      throw new BadRequestException('Price must be greater than 0');
    }
    if (createBookDto.inventoryQuantity < 0) {
      throw new BadRequestException('InventoryQuantity must be greater than 0');
    }

    // 建立書籍（cascade: true 會自動儲存 images）
    // merchantId 從 JWT token 取得，覆寫 DTO 中的值
    const book = this.booksRepository.create({
      ...createBookDto,
      merchantId,
    });
    return await this.booksRepository.save(book);
  }

  /**
   * 查詢所有書籍（包含圖片）
   */
  async findAll(): Promise<Book[]> {
    return await this.booksRepository.find({
      where: { status: 1 },
      relations: ['images'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * 根據 ID 查詢單一書籍（包含圖片）
   */
  async findByID(id: string): Promise<Book> {
    const book = await this.booksRepository.findOne({
      where: {bookID: id},     
      relations: ['images'],
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    return book;
  }

  /**
   * 根據 ISBN 查詢書籍
   */
  async findByISBN(isbn: string): Promise<Book> {
    const book = await this.booksRepository.findOne({
      where: {ISBN: isbn}, 
      relations: ['images'],
    });

    if (!book) {
      throw new NotFoundException(`Book with ISBN ${isbn} not found`);
    }

    return book;
  }

  /**
   * 更新書籍資訊
   */
  async update(id: string, updateBookDto: UpdateBookDto, merchantId: string): Promise<Book> {
    const book = await this.findByID(id);

    // 驗證是否為書籍擁有者
    if (book.merchantId !== merchantId) {
      throw new BadRequestException('Access denied: You can only update your own books');
    }

    // 驗證價格
    if (updateBookDto.price !== undefined && updateBookDto.price <= 0) {
      throw new BadRequestException('Price must be greater than 0');
    }

    // 驗證庫存
    if (updateBookDto.inventoryQuantity !== undefined) {
      if (updateBookDto.inventoryQuantity < 0) {
        throw new BadRequestException('InventoryQuantity must be greater or equal to 0');
      }
    }

    // 如果要更新 ISBN，檢查是否重複
    if (updateBookDto.ISBN && updateBookDto.ISBN !== book.ISBN) {
      const existingBook = await this.booksRepository.findOne({
        where: { ISBN: updateBookDto.ISBN },
      });
      if (existingBook) {
        throw new ConflictException('ISBN already exists');
      }
    }

    // 處理圖片更新
    if (updateBookDto.images) {
      // 先刪除舊圖片
      await this.bookImagesRepository.delete({ bookID: id });

      // 新增新圖片，確保每個圖片都有 bookID
      const newImages = updateBookDto.images.map((img) =>
        this.bookImagesRepository.create({
          ...img,
          bookID: id,
        })
      );
      await this.bookImagesRepository.save(newImages);

      // 從 updateBookDto 中移除 images，避免後續的 Object.assign 處理
      delete updateBookDto.images;
    }

    // 更新資料（不包含 images）
    Object.assign(book, updateBookDto);
    return await this.booksRepository.save(book);
  }

  /**
   * 刪除書籍（會自動刪除關聯的圖片，因為 onDelete: CASCADE）
   */
  async remove(id: string, merchantId: string): Promise<void> {
    const book = await this.findByID(id);

    // 驗證是否為書籍擁有者
    if (book.merchantId !== merchantId) {
      throw new BadRequestException('Access denied: You can only delete your own books');
    }

    await this.booksRepository.remove(book);
  }

  /**
   * 更新書籍狀態（上架/下架）
   */
  async updateStatus(id: string, status: number, merchantId: string): Promise<Book> {
    const book = await this.findByID(id);

    // 驗證是否為書籍擁有者
    if (book.merchantId !== merchantId) {
      throw new BadRequestException('Access denied: You can only update your own books');
    }

    if (status !== 0 && status !== 1) {
      throw new BadRequestException('Status must be 0 (sold out) or 1 (available)');
    }

    book.status = status;
    return await this.booksRepository.save(book);
  }

  /**
   * 新增書籍圖片
   */
  async addImage(bookID: string, imageUrl: string, displayOrder: number, isCover: boolean): Promise<BookImage> {
    const book = await this.findByID(bookID);

    const bookImage = this.bookImagesRepository.create({
      bookID,
      imageUrl,
      displayOrder,
      isCover,
    });

    return await this.bookImagesRepository.save(bookImage);
  }

  /**
   * 刪除書籍圖片
   */
  async removeImage(imageID: string): Promise<void> {
    const image = await this.bookImagesRepository.findOne({
      where: { imageID },
    });

    if (!image) {
      throw new NotFoundException(`Image with ID ${imageID} not found`);
    }

    await this.bookImagesRepository.remove(image);
  }

  /**
   * 根據多個條件搜尋書籍（模糊搜尋）
   */
  async search(params: {
    keyword?: string;
    isbn?: string;
    name?: string;
    author?: string;
    publisher?: string;
    merchantName?: string;
  }): Promise<Book[]> {
    const queryBuilder = this.booksRepository
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.images', 'images')
      .leftJoin('book.merchant', 'merchant')
      .addSelect([
        'merchant.memberID',
        'merchant.email',
        'merchant.account',
        'merchant.phoneNumber',
        'merchant.merchantName',
        'merchant.merchantAddress',
      ])
      .select([
        'book.bookID',
        'book.ISBN',
        'book.name',
        'book.status',
        'book.productDescription',
        'book.inventoryQuantity',
        'book.price',
        'book.author',
        'book.publisher',
        'book.merchantId',
        // 'book.createdAt', // Excluded
        // 'book.updatedAt', // Excluded
        'images.imageID',
        'images.imageUrl',
        'images.displayOrder',
        'images.isCover',
        'merchant.memberID',
        'merchant.email',
        'merchant.account',
        'merchant.phoneNumber',
        'merchant.merchantName',
        'merchant.merchantAddress',
      ])
      .where('book.status = :status', { status: 1 });

    // 根據提供的參數動態建立查詢條件
    if (params.keyword) {
      const keyword = `%${params.keyword}%`;
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('book.ISBN LIKE :keyword', { keyword })
            .orWhere('book.name LIKE :keyword', { keyword })
            .orWhere('book.author LIKE :keyword', { keyword })
            .orWhere('book.publisher LIKE :keyword', { keyword })
            .orWhere('book.productDescription LIKE :keyword', { keyword })
            .orWhere('merchant.merchantName LIKE :keyword', { keyword });
        }),
      );
    }

    if (params.isbn) {
      queryBuilder.andWhere('book.ISBN LIKE :isbn', { isbn: `%${params.isbn}%` });
    }

    if (params.name) {
      queryBuilder.andWhere('book.name LIKE :name', { name: `%${params.name}%` });
    }

    if (params.author) {
      queryBuilder.andWhere('book.author LIKE :author', { author: `%${params.author}%` });
    }

    if (params.publisher) {
      queryBuilder.andWhere('book.publisher LIKE :publisher', { publisher: `%${params.publisher}%` });
    }

    // 如果提供商家名字，檢查 merchant.merchantName
    if (params.merchantName) {
      queryBuilder.andWhere('merchant.merchantName LIKE :merchantName', { merchantName: `%${params.merchantName}%` });
    }

    return await queryBuilder
      .orderBy('book.createdAt', 'DESC')
      .getMany();
  }
}
