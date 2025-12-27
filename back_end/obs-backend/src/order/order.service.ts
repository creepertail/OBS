// src/order/order.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { Contains } from './entities/contains.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Member } from '../member/entities/member.entity';
import { MemberType } from '../member/member-type.enum';
import { Book } from '../book/entities/book.entity';

export interface CreateOrderItem {
  bookId: string;
  quantity: number;
}

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Contains)
    private readonly containsRepository: Repository<Contains>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
  ) { }

  /**
   * 建立新訂單（User 下訂單）
   */
  async create(
    createOrderDto: CreateOrderDto,
    userId: string,
    items: CreateOrderItem[]
  ): Promise<Order> {
    // 驗證使用者存在且為 User 類型
    const user = await this.memberRepository.findOne({
      where: { memberID: userId, type: MemberType.User }
    });

    if (!user) {
      throw new BadRequestException('Only users can create orders');
    }

    // 驗證訂單項目
    if (!items || items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    // 從書籍資料取得 merchantId
    const bookIds = items.map(item => item.bookId);
    const books = await this.booksRepository.findByIds(bookIds);

    // 驗證所有書籍都存在
    if (books.length !== bookIds.length) {
      throw new NotFoundException('Some books not found');
    }

    // 驗證書籍庫存
    for (const item of items) {
      const book = books.find(b => b.bookID === item.bookId);
      if (!book) {
        throw new NotFoundException(`Book with ID ${item.bookId} not found`);
      }
      if (book.inventoryQuantity < item.quantity) {
        throw new BadRequestException(`Insufficient inventory for book: ${book.name}`);
      }
      if (book.status !== 1) {
        throw new BadRequestException(`Book ${book.name} is not available`);
      }
    }

    // 確認所有書籍都屬於同一個商家
    const merchantIds = [...new Set(books.map(book => book.merchantId))];
    if (merchantIds.length > 1) {
      throw new BadRequestException('All books in an order must belong to the same merchant');
    }

    const merchantId = merchantIds[0];

    // 驗證商家存在
    const merchant = await this.memberRepository.findOne({
      where: { memberID: merchantId, type: MemberType.Merchant }
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    // 建立訂單（使用 JWT 的 userId 和從書籍取得的 merchantId）
    const order = this.orderRepository.create({
      ...createOrderDto,
      userId,
      merchantId,
      state: createOrderDto.state ?? 0,
    });

    const savedOrder = await this.orderRepository.save(order);

    // 建立訂單項目（Contains）
    for (const item of items) {
      const contains = this.containsRepository.create({
        orderId: savedOrder.orderId,
        bookId: item.bookId,
        quantity: item.quantity,
      });
      await this.containsRepository.save(contains);
    }

    // 回傳完整訂單（包含 contains）
    return this.findByID(savedOrder.orderId, userId);
  }

  /**
   * 查詢所有訂單（根據使用者類型過濾）
   */
  async findAll(userId: string, userType: MemberType): Promise<Order[]> {
    let query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.contains', 'contains')
      .leftJoinAndSelect('contains.book', 'book')
      .leftJoin('order.user', 'user')
      .leftJoin('order.merchant', 'merchant')
      .addSelect([
        'user.memberID',
        'user.userName',
        'merchant.memberID',
        'merchant.merchantName',
        'merchant.merchantAddress',
      ])
      .orderBy('order.orderDate', 'DESC');

    if (userType === MemberType.Admin) {
      // Admin 可以查看所有訂單
      return await query.getMany();
    } else if (userType === MemberType.User) {
      // User 只能查看自己的訂單
      return await query.where('order.userId = :userId', { userId }).getMany();
    } else if (userType === MemberType.Merchant) {
      // Merchant 查看自己商店的訂單
      return await query.where('order.merchantId = :merchantId', { merchantId: userId }).getMany();
    } else {
      // 如果不是以上三種類型，回傳空陣列
      return [];
    }
  }

  /**
   * 根據 ID 查詢單一訂單
   */
  async findByID(orderId: string, requesterId: string, requesterType?: MemberType): Promise<Order> {
    const order = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.contains', 'contains')
      .leftJoin('order.user', 'user')
      .leftJoin('order.merchant', 'merchant')
      .addSelect([
        'user.memberID',
        'user.userName',
        'merchant.memberID',
        'merchant.merchantName',
        'merchant.merchantAddress',
      ])
      .where('order.orderId = :orderId', { orderId })
      .getOne();

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // 權限檢查（如果有提供 requesterType）
    if (requesterType !== undefined) {
      if (requesterType === MemberType.Admin) {
        // Admin 可以查看所有訂單
        return order;
      } else if (requesterType === MemberType.User) {
        // User 只能查看自己的訂單
        if (order.userId !== requesterId) {
          throw new ForbiddenException('You can only view your own orders');
        }
      } else if (requesterType === MemberType.Merchant) {
        // Merchant 只能查看自己商店的訂單
        if (order.merchantId !== requesterId) {
          throw new ForbiddenException('You can only view orders for your store');
        }
      }
    }

    return order;
  }

  /**
   * 更新訂單資訊
   */
  async update(
    orderId: string,
    updateOrderDto: UpdateOrderDto,
    requesterId: string,
    requesterType: MemberType
  ): Promise<Order> {
    const order = await this.findByID(orderId, requesterId, requesterType);

    // 權限檢查
    if (requesterType === MemberType.User) {
      // User 只能修改配送地址和付款方式
      if (updateOrderDto.state !== undefined ||
        updateOrderDto.totalPrice !== undefined ||
        updateOrderDto.totalQuantity !== undefined) {
        throw new ForbiddenException('Users can only update shipping address and payment method');
      }

      if (order.userId !== requesterId) {
        throw new ForbiddenException('You can only update your own orders');
      }
    } else if (requesterType === MemberType.Merchant) {
      // Merchant 只能修改訂單狀態
      if (updateOrderDto.shippingAddress !== undefined ||
        updateOrderDto.paymentMethod !== undefined ||
        updateOrderDto.totalPrice !== undefined ||
        updateOrderDto.totalQuantity !== undefined) {
        throw new ForbiddenException('Merchants can only update order state');
      }

      if (order.merchantId !== requesterId) {
        throw new ForbiddenException('You can only update orders for your store');
      }
    }
    // Admin 可以修改所有欄位

    Object.assign(order, updateOrderDto);
    return this.orderRepository.save(order);
  }

  /**
   * 刪除訂單
   */
  async remove(orderId: string, requesterId: string, requesterType: MemberType): Promise<void> {
    const order = await this.findByID(orderId, requesterId, requesterType);

    // 只有 Admin 和訂單擁有者可以刪除訂單
    if (requesterType === MemberType.User && order.userId !== requesterId) {
      throw new ForbiddenException('You can only delete your own orders');
    }

    if (requesterType === MemberType.Merchant) {
      throw new ForbiddenException('Merchants cannot delete orders');
    }

    await this.orderRepository.remove(order);
  }

  /**
   * 查詢使用者的所有訂單
   */
  async findByUserId(userId: string): Promise<Order[]> {
    return this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.contains', 'contains')
      .leftJoin('order.merchant', 'merchant')
      .addSelect([
        'merchant.memberID',
        'merchant.merchantName',
        'merchant.merchantAddress',
      ])
      .where('order.userId = :userId', { userId })
      .orderBy('order.orderDate', 'DESC')
      .getMany();
  }

  /**
   * 查詢商家的所有訂單
   */
  async findByMerchantId(merchantId: string): Promise<Order[]> {
    return this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.contains', 'contains')
      .leftJoin('order.user', 'user')
      .addSelect([
        'user.memberID',
        'user.userName',
      ])
      .where('order.merchantId = :merchantId', { merchantId })
      .orderBy('order.orderDate', 'DESC')
      .getMany();
  }
}
