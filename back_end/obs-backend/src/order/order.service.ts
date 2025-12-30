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
import { AddsToCart } from '../cart/entities/adds-to-cart.entity';
import { CheckoutOrderDto } from './dto/checkout-order.dto';
import { Claim } from '../claims/entities/claim.entity';
import { Coupon } from '../coupon/entities/coupon.entity';
import { MemberService } from '../member/member.service';

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
    @InjectRepository(AddsToCart)
    private readonly cartRepository: Repository<AddsToCart>,
    @InjectRepository(Claim)
    private readonly claimRepository: Repository<Claim>,
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    private readonly memberService: MemberService,
  ) { }

  private readonly baseShippingFee = 60;

  private applyDiscount(base: number, discountRaw: number): { value: number; discountAmount: number } {
    const discount = Number(discountRaw);
    if (!Number.isFinite(discount) || discount <= 0) {
      throw new BadRequestException('Invalid coupon discount value');
    }
    const value = discount < 1 ? base * discount : Math.max(0, base - discount);
    return { value, discountAmount: base - value };
  }

  /**
   * Checkout from cart by merchant, calculate totals, apply coupon, create order.
   */
  async checkout(dto: CheckoutOrderDto, userId: string) {
    const user = await this.memberRepository.findOne({ where: { memberID: userId, type: MemberType.User } });
    if (!user) {
      throw new BadRequestException('Only users can checkout');
    }
    if ((user.userState ?? 0) % 2 === 1) {
      throw new ForbiddenException('You are not allowed to place an order.');
    }

    const merchant = await this.memberRepository.findOne({ where: { memberID: dto.merchantId, type: MemberType.Merchant } });
    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }
    if ((merchant.merchantState ?? 0) % 2 === 1) {
      throw new ForbiddenException('The merchant is not allowed to sell books.');
    }

    const cartItems = await this.cartRepository.createQueryBuilder('cart')
      .leftJoinAndSelect('cart.book', 'book')
      .where('cart.userID = :userId', { userId })
      .andWhere('book.merchantId = :merchantId', { merchantId: dto.merchantId })
      .getMany();

    if (!cartItems.length) {
      throw new BadRequestException('No items in cart for this merchant');
    }

    // Validate inventory & availability, and calculate subtotal/quantity
    let subtotal = 0;
    let totalQuantity = 0;
    for (const item of cartItems) {
      if (!item.book) {
        throw new NotFoundException('Book not found in cart item');
      }
      if (item.book.status !== 1) {
        throw new BadRequestException(`Book ${item.book.name} is not available`);
      }
      if (item.book.inventoryQuantity < item.quantity) {
        throw new BadRequestException(`Insufficient inventory for book: ${item.book.name}`);
      }
      subtotal += item.book.price * item.quantity;
      totalQuantity += item.quantity;
    }

    let shippingFee = this.baseShippingFee;
    let discountedSubtotal = subtotal;
    let discountAmount = 0;
    let appliedCouponId: string | undefined;

    let claimToUpdate: Claim | undefined;

    if (dto.claimId) {
      const claim = await this.claimRepository.findOne({
        where: { claimID: dto.claimId },
        relations: ['coupon'],
      });
      if (!claim) {
        throw new NotFoundException('Claim not found');
      }
      if (claim.userID !== userId) {
        throw new ForbiddenException('Cannot use coupon claimed by another user');
      }
      if (claim.state !== 0) {
        throw new BadRequestException('Coupon has already been used or voided');
      }

      const coupon = claim.coupon;
      if (!coupon) {
        throw new NotFoundException('Coupon not found');
      }
      if (coupon.validDate && coupon.validDate.getTime() < Date.now()) {
        throw new BadRequestException('Coupon is expired');
      }

      const owner = await this.memberRepository.findOne({ where: { memberID: coupon.memberID } });
      if (!owner) {
        throw new NotFoundException('Coupon owner not found');
      }
      const effectiveDiscountType =
        coupon.discountType === null || coupon.discountType === undefined
          ? owner.type === MemberType.Admin
            ? 1
            : 0
          : coupon.discountType;

      if (owner.type === MemberType.Merchant && coupon.memberID !== dto.merchantId) {
        throw new ForbiddenException('Coupon is not valid for this merchant');
      } else if (owner.type !== MemberType.Admin && owner.type !== MemberType.Merchant) {
        throw new ForbiddenException('Invalid coupon owner');
      }

      if (effectiveDiscountType === 0 && coupon.memberID !== dto.merchantId) {
        throw new ForbiddenException('This coupon is restricted to a specific merchant');
      }

      const discountValue = Number(coupon.discount);
      if (!Number.isFinite(discountValue) || discountValue <= 0) {
        throw new BadRequestException('Invalid coupon discount value');
      }

      if (effectiveDiscountType === 2) {
        const result = this.applyDiscount(shippingFee, discountValue);
        shippingFee = result.value;
        discountAmount = result.discountAmount;
      } else {
        const result = this.applyDiscount(subtotal, discountValue);
        discountedSubtotal = result.value;
        discountAmount = result.discountAmount;
      }
      appliedCouponId = coupon.couponID;
      claimToUpdate = claim;
    }

    const total = Math.round(discountedSubtotal + shippingFee);

    const order = this.orderRepository.create({
      shippingAddress: dto.shippingAddress,
      paymentMethod: dto.paymentMethod,
      totalPrice: total,
      totalQuantity,
      state: 0,
      userId,
      merchantId: dto.merchantId,
      couponId: appliedCouponId,
    });

    const savedOrder = await this.orderRepository.save(order);

    for (const item of cartItems) {
      const contains = this.containsRepository.create({
        orderId: savedOrder.orderId,
        bookId: item.bookID,
        quantity: item.quantity,
      });
      await this.containsRepository.save(contains);

      // decrement inventory
      item.book.inventoryQuantity -= item.quantity;
      await this.booksRepository.save(item.book);
    }

    if (claimToUpdate) {
      claimToUpdate.state = 1;
      claimToUpdate.usedAt = new Date();
      await this.claimRepository.save(claimToUpdate);
    }

    // clear purchased items from cart
    await this.cartRepository.delete(
      cartItems.map(ci => ({ userID: userId, bookID: ci.bookID }))
    );

    // Update member level based on total spending
    await this.memberService.updateMemberLevel(userId);

    return {
      order: await this.findByID(savedOrder.orderId, userId, MemberType.User),
      pricing: {
        subtotal,
        discountedSubtotal,
        shippingFee,
        discountAmount,
        total,
        couponId: appliedCouponId,
      },
    };
  }

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

    const userState = (user.userState ?? 0) % 2 === 1;
    // 驗證 User 下訂權限
    if (userState) {
      throw new ForbiddenException('You are not allowed to place an order.');
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

    // 驗證商家狀態
    const merchantState = (merchant.merchantState ?? 0) % 2 === 1;
    if(merchantState) {
      throw new ForbiddenException('The merchant is not allowed to sell books.'); 
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
      .leftJoinAndSelect('book.images', 'images', 'images.isCover = :isCover', { isCover: true })
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
      if (order.userId !== requesterId) {
        throw new ForbiddenException('You can only update your own orders');
      }

      if (
        updateOrderDto.shippingAddress !== undefined ||
        updateOrderDto.paymentMethod !== undefined ||
        updateOrderDto.totalPrice !== undefined ||
        updateOrderDto.totalQuantity !== undefined
      ) {
        throw new ForbiddenException('Users can only update shipping address and payment method');
      }

      // User 只能在訂單 state=3（已完成）時，把狀態改成 4（已收貨）
      if (updateOrderDto.state !== undefined) {
        const allowed = order.state === 3 && updateOrderDto.state === 4;
        if (!allowed) {
          throw new ForbiddenException('Users can only set state to 4 when current state is 3');
        }
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

      // 商家不能把狀態從 3 改成 4（收貨只能由顧客操作）
      if (updateOrderDto.state !== undefined && order.state === 3 && updateOrderDto.state === 4) {
        throw new ForbiddenException('Only users can confirm receipt (set state to 4)');
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
