// src/cart/cart.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddsToCart } from './entities/adds-to-cart.entity';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { Book } from '../book/entities/book.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(AddsToCart)
    private readonly cartRepository: Repository<AddsToCart>,
    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
  ) { }

  private async ensureBookAvailable(bookID: string): Promise<Book> {
    const book = await this.booksRepository.findOne({ where: { bookID } });

    if (!book) {
      throw new NotFoundException(`Book with ID ${bookID} not found`);
    }

    if (book.status !== 1) {
      throw new BadRequestException('Book is not available');
    }

    return book;
  }

  // 新增商品到購物車，會累加數量，數量不可超過庫存
  async addItem(userId: string, createCartItemDto: CreateCartItemDto): Promise<AddsToCart> {
    const { bookID, amount } = createCartItemDto;

    const book = await this.ensureBookAvailable(bookID);
    const existing = await this.cartRepository.findOne({
      where: { userID: userId, bookID },
    });

    const newAmount = (existing?.amount ?? 0) + amount;
    if (newAmount > book.inventoryQuantity) {
      throw new BadRequestException('Amount exceeds inventory');
    }

    if (existing) {
      existing.amount = newAmount;
      return this.cartRepository.save(existing);
    }

    const item = this.cartRepository.create({
      userID: userId,
      bookID,
      amount: newAmount,
    });

    return this.cartRepository.save(item);
  }

  // 取得使用者的購物車清單(依照 merchantID 分組)
  async findMyCart(userId: string): Promise<Array<{
    merchantId: string;
    items: Array<{ bookID: string; amount: number } & Book>;
  }>> {
    const items = await this.cartRepository.find({
      where: { userID: userId },
      relations: ['book', 'book.images'],
    });

    // 將購物車項目依照 merchantId 分組
    const groupedByMerchant = items.reduce((acc, { bookID, amount, book }) => {
      const merchantId = book.merchantId;

      if (!acc[merchantId]) {
        acc[merchantId] = [];
      }

      acc[merchantId].push({
        amount,
        ...book,
        images: book.images?.filter(img => img.isCover === true) || [],
      });

      return acc;
    }, {} as Record<string, Array<{ bookID: string; amount: number } & Book>>);

    // 將分組結果轉換為陣列格式
    return Object.entries(groupedByMerchant).map(([merchantId, items]) => ({
      merchantId,
      items,
    }));
  }

  // 更新購物車中某商品的數量
  async updateItem(userId: string, bookId: string, updateCartItemDto: UpdateCartItemDto): Promise<AddsToCart> {
    const cartItem = await this.cartRepository.findOne({
      where: { userID: userId, bookID: bookId },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    const book = await this.ensureBookAvailable(bookId);

    if (updateCartItemDto.amount > book.inventoryQuantity) {
      throw new BadRequestException('Amount exceeds inventory');
    }

    cartItem.amount = updateCartItemDto.amount;
    return this.cartRepository.save(cartItem);
  }

  // 移除購物車中的單一商品
  async removeItem(userId: string, bookId: string): Promise<void> {
    const result = await this.cartRepository.delete({ userID: userId, bookID: bookId });

    if (result.affected === 0) {
      throw new NotFoundException('Cart item not found');
    }
  }

  // 清空購物車
  async clearCart(userId: string): Promise<void> {
    await this.cartRepository.delete({ userID: userId });
  }

  // 根據 merchantID 取得使用者購物車中該商家的商品
  async findItemsInMyCartByMerchantID(userId: string, merchantId: string): Promise<Array<{ bookID: string; amount: number } & Book>> {
    const items = await this.cartRepository.find({
      where: { userID: userId },
      relations: ['book', 'book.images'],
    });

    // 過濾出屬於指定商家的商品
    const merchantItems = items
      .filter(item => item.book.merchantId === merchantId)
      .map(({ book, amount }) => ({
        amount,
        ...book,
        images: book.images?.filter(img => img.isCover === true) || [],
      }));

    return merchantItems;
  }
}
