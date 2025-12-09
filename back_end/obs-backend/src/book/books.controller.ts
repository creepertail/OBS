// src/book/books.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, UseInterceptors, UploadedFile, BadRequestException, Request, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { JWTGuard } from '../member/decorators/jwt-guard.decorator';
import { MemberType } from '../member/member-type.enum';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) { }

  /**
   * POST /books/upload-image - 上傳書籍圖片
   * 回傳圖片的 URL，之後可以在建立或更新書籍時使用
   */
  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/books',
      filename: (req, file, callback) => {
        // 產生唯一檔名：時間戳記 + 隨機數 + 原始副檔名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        const filename = `book-${uniqueSuffix}${ext}`;
        callback(null, filename);
      },
    }),
    fileFilter: (req, file, callback) => {
      // 只接受圖片格式
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        return callback(new BadRequestException('只允許上傳圖片檔案！（jpg, jpeg, png, gif, webp）'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 限制 5MB
    },
  }))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('請選擇要上傳的圖片');
    }

    // 回傳圖片 URL（相對路徑）
    const imageUrl = `http://localhost:3000/uploads/books/${file.filename}`;
    return {
      url: imageUrl,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  /**
   * POST /books - 建立新書籍
   */
  // ValidationPipe 會自動檢查 request body 的資料是否符合 CreateBookDto 的驗證規則
  @Post()
  @JWTGuard(MemberType.Merchant)
  create(@Body(new ValidationPipe()) createBookDto: CreateBookDto, @Request() req) {
    // 從 JWT token 的 sub 欄位取得 merchantId
    const merchantId = req.member.sub;
    return this.booksService.create(createBookDto, merchantId);
  }

  /**
   * GET /books/search - 根據條件搜尋書籍（支援模糊搜尋）
   * Query 參數：isbn, name, author, publisher, merchantName, status
   */
  @Get('search')
  search(
    @Query('isbn') isbn?: string,
    @Query('name') name?: string,
    @Query('author') author?: string,
    @Query('publisher') publisher?: string,
    @Query('merchantName') merchantName?: string,
    @Query('status') status?: string,
    @Query('keyword') keyword?: string,
  ) {
    return this.booksService.search({
      keyword,
      isbn,
      name,
      author,
      publisher,
      merchantName,
      status: status ? parseInt(status) : undefined,
    });
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
  @JWTGuard(MemberType.Merchant)
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateBookDto: UpdateBookDto,
    @Request() req
  ) {
    // 從 JWT token 的 sub 欄位取得 merchantId
    const merchantId = req.member.sub;
    return this.booksService.update(id, updateBookDto, merchantId);
  }

  /**
   * PATCH /books/:id/status - 更新書籍狀態
   */
  @Patch(':id/status')
  @JWTGuard(MemberType.Merchant)
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: number,
    @Request() req
  ) {
    // 從 JWT token 的 sub 欄位取得 merchantId
    const merchantId = req.member.sub;
    return this.booksService.updateStatus(id, status, merchantId);
  }

  /**
   * DELETE /books/:id - 刪除書籍
   */
  @Delete(':id')
  @JWTGuard(MemberType.Merchant)
  remove(@Param('id') id: string, @Request() req) {
    // 從 JWT token 的 sub 欄位取得 merchantId
    const merchantId = req.member.sub;
    return this.booksService.remove(id, merchantId);
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
