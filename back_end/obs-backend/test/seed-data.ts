import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';
import { Member } from '../src/member/entities/member.entity';
import { MemberType } from '../src/member/member-type.enum';
import { Category } from '../src/category/entities/categories.entity';
import { Book } from '../src/book/entities/book.entity';
import { BookImage } from '../src/book/entities/book-image.entity';
import { BelongsTo } from '../src/belongs-to/entities/belongs-to.entity';
import { Order } from '../src/order/entities/order.entity';
import { Contains } from '../src/order/entities/contains.entity';
import { AddsToCart } from '../src/cart/entities/adds-to-cart.entity';
import { Coupon } from '../src/coupon/entities/coupon.entity';
import { Claim } from '../src/claims/entities/claim.entity';
import { Manage } from '../src/manage/entities/manage.entity';
import { Favorite } from '../src/favorite/entities/favorite.entity';
import { Review } from '../src/review/entities/review.entity';

config();

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'OBS',
  entities: [Member, Category, Book, BookImage, BelongsTo, Order, Contains, AddsToCart, Coupon, Claim, Manage, Favorite, Review],
  synchronize: false,
  logging: true,
});

async function seedData() {
  try {
    console.log('Connecting to DB...');
    await AppDataSource.initialize();
    console.log('DB connected');

    console.log('Clearing tables...');
    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    await AppDataSource.getRepository(Claim).clear();
    await AppDataSource.getRepository(Contains).clear();
    await AppDataSource.getRepository(Favorite).clear();
    await AppDataSource.getRepository(Review).clear();
    await AppDataSource.getRepository(Manage).clear();
    await AppDataSource.getRepository(Order).clear();
    await AppDataSource.getRepository(BelongsTo).clear();
    await AppDataSource.getRepository(BookImage).clear();
    await AppDataSource.getRepository(Book).clear();
    await AppDataSource.getRepository(Coupon).clear();
    await AppDataSource.getRepository(Category).clear();
    await AppDataSource.getRepository(Member).clear();
    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Tables cleared');

    const memberRepo = AppDataSource.getRepository(Member);
    const categoryRepo = AppDataSource.getRepository(Category);
    const bookRepo = AppDataSource.getRepository(Book);
    const bookImageRepo = AppDataSource.getRepository(BookImage);
    const belongsToRepo = AppDataSource.getRepository(BelongsTo);
    const couponRepo = AppDataSource.getRepository(Coupon);
    const claimRepo = AppDataSource.getRepository(Claim);
    const favoriteRepo = AppDataSource.getRepository(Favorite);
    const reviewRepo = AppDataSource.getRepository(Review);
    const orderRepo = AppDataSource.getRepository(Order);
    const containsRepo = AppDataSource.getRepository(Contains);

    // Members
    console.log('Seeding members...');
    const admin = await memberRepo.save({
      email: 'admin@example.com',
      account: 'admin',
      password: await bcrypt.hash('0000', 10),
      phoneNumber: '0900000000',
      type: MemberType.Admin,
    });

    const merchant1 = await memberRepo.save({
      email: 'merchant1@example.com',
      account: 'merchant1',
      password: await bcrypt.hash('0000', 10),
      phoneNumber: '0912345001',
      type: MemberType.Merchant,
      merchantName: 'Shop One',
      merchantAddress: 'Taipei',
      merchantState: 0,
      merchantSubscriberCount: 0,
    });

    const merchant2 = await memberRepo.save({
      email: 'merchant2@example.com',
      account: 'merchant2',
      password: await bcrypt.hash('0000', 10),
      phoneNumber: '0912345002',
      type: MemberType.Merchant,
      merchantName: 'Shop Two',
      merchantAddress: 'Taichung',
      merchantState: 0,
      merchantSubscriberCount: 0,
    });

    const user1 = await memberRepo.save({
      email: 'user1@example.com',
      account: 'user1',
      password: await bcrypt.hash('0000', 10),
      phoneNumber: '0923456001',
      type: MemberType.User,
      userName: 'Alice',
      userLevel: 1,
      userState: 0,
    });

    const user2 = await memberRepo.save({
      email: 'user2@example.com',
      account: 'user2',
      password: await bcrypt.hash('0000', 10),
      phoneNumber: '0923456002',
      type: MemberType.User,
      userName: 'Bob',
      userLevel: 1,
      userState: 0,
    });

    console.log('Members seeded');

    // Categories
    const categories = await categoryRepo.save([
      { name: '程式設計', description: '程式與開發書籍' },
      { name: '商業管理', description: '商業與管理相關' },
    ]);

    // Books
    console.log('Seeding books...');
    const book1 = await bookRepo.save({
      ISBN: '9780000000001',
      name: 'TypeScript 入門',
      status: 1,
      productDescription: 'TS basics',
      inventoryQuantity: 100,
      price: 500,
      author: 'Author A',
      publisher: 'Publisher A',
      merchantId: merchant1.memberID,
    });

    const book2 = await bookRepo.save({
      ISBN: '9780000000002',
      name: '商管思維',
      status: 1,
      productDescription: 'Business thinking',
      inventoryQuantity: 80,
      price: 600,
      author: 'Author B',
      publisher: 'Publisher B',
      merchantId: merchant2.memberID,
    });

    await bookImageRepo.save([
      { imageUrl: 'http://localhost:3000/uploads/books/book1.jpg', displayOrder: 0, isCover: true, book: book1 },
      { imageUrl: 'http://localhost:3000/uploads/books/book2.jpg', displayOrder: 0, isCover: true, book: book2 },
    ]);

    await belongsToRepo.save([
      { bookID: book1.bookID, categoryId: categories[0].categoryID },
      { bookID: book2.bookID, categoryId: categories[1].categoryID },
    ]);

    console.log('Books seeded');

    // Coupons & claims
    const coupon1 = await couponRepo.save({
      quantity: 100,
      validDate: new Date('2026-12-31T00:00:00Z'),
      discount: 0.9,
      description: '平台年末優惠',
      redemptionCode: 'PLATFORM-90',
      memberID: admin.memberID,
    });

    const coupon2 = await couponRepo.save({
      quantity: 50,
      validDate: new Date('2025-12-31T00:00:00Z'),
      discount: 0.8,
      description: '商家迎新券',
      redemptionCode: 'SHOP1-80',
      memberID: merchant1.memberID,
    });

    await claimRepo.save([
      { userID: user1.memberID, couponID: coupon1.couponID, state: 0 },
      { userID: user2.memberID, couponID: coupon2.couponID, state: 0 },
    ]);

    // Favorites & reviews
    await favoriteRepo.save([
      { userID: user1.memberID, bookID: book1.bookID },
      { userID: user2.memberID, bookID: book2.bookID },
    ]);

    await reviewRepo.save([
      { userID: user1.memberID, bookID: book1.bookID, date: new Date('2025-01-01'), stars: 5, description: '很好用的入門書' },
      { userID: user2.memberID, bookID: book2.bookID, date: new Date('2025-01-02'), stars: 4, description: '內容實用' },
    ]);

    // Orders
    const order1 = await orderRepo.save({
      shippingAddress: '台北市某路1號',
      paymentMethod: 1,
      totalPrice: 500,
      totalQuantity: 1,
      state: 1,
      userId: user1.memberID,
      merchantId: merchant1.memberID,
    });

    await containsRepo.save({ orderId: order1.orderId, bookId: book1.bookID, quantity: 1 });

    console.log('Seed done');
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('DB connection closed');
    }
  }
}

seedData();
