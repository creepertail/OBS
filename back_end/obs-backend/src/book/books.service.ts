// src/book/books.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entityies/book.entity';
import { BookImage } from './entityies/book-image.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
    @InjectRepository(BookImage)
    private bookImagesRepository: Repository<BookImage>,
  ) {}

  /**
   * 建立新書籍（包含圖片）
   */
  async create(createBookDto: CreateBookDto): Promise<Book> {
    // 驗證價格和庫存
    if (createBookDto.Price <= 0) {
      throw new BadRequestException('Price must be greater than 0');
    }
    if (createBookDto.InventoryQuantity <= 0) {
      throw new BadRequestException('InventoryQuantity must be greater than 0');
    }

    // 建立書籍（cascade: true 會自動儲存 images）
    const book = this.booksRepository.create(createBookDto);
    return await this.booksRepository.save(book);
  }

  /**
   * 查詢所有書籍（包含圖片）
   */
  async findAll(): Promise<Book[]> {
    return await this.booksRepository.find({
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
      where: { bookID: id },
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
      where: { ISBN: isbn },
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
  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    const book = await this.findByID(id);

    // 驗證價格
    if (updateBookDto.Price !== undefined && updateBookDto.Price <= 0) {
      throw new BadRequestException('Price must be greater than 0');
    }

    // 驗證庫存
    if (updateBookDto.InventoryQuantity !== undefined && updateBookDto.InventoryQuantity <= 0) {
      throw new BadRequestException('InventoryQuantity must be greater than 0');
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

    // 更新資料
    Object.assign(book, updateBookDto);
    return await this.booksRepository.save(book);
  }

  /**
   * 刪除書籍（會自動刪除關聯的圖片，因為 onDelete: CASCADE）
   */
  async remove(id: string): Promise<void> {
    const book = await this.findByID(id);
    await this.booksRepository.remove(book);
  }

  /**
   * 更新書籍狀態（上架/下架）
   */
  async updateStatus(id: string, status: number): Promise<Book> {
    const book = await this.findByID(id);

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
}
