// src/report/entities/merchant-book-sales.view.ts
import { ViewEntity, ViewColumn, DataSource } from 'typeorm';
import { Book } from '../../book/entities/book.entity';
import { Contains } from '../../order/entities/contains.entity';
import { Order } from '../../order/entities/order.entity';

/**
 * 商家書籍銷售統計視圖
 * 聚合每個商家的每本書籍銷售資料（用於暢銷書統計）
 */
@ViewEntity({
  expression: (dataSource: DataSource) =>
    dataSource
      .createQueryBuilder()
      .select('book.merchantId', 'merchantId')
      .addSelect('book.bookID', 'bookId')
      .addSelect('book.name', 'bookName')
      .addSelect('book.ISBN', 'ISBN')
      .addSelect('book.price', 'price')
      // 總銷售數量
      .addSelect('COALESCE(SUM(contain.quantity), 0)', 'totalQuantitySold')
      // 總銷售金額
      .addSelect('COALESCE(SUM(contain.quantity * book.price), 0)', 'totalRevenue')
      // 訂單數（包含此書的訂單數量）
      .addSelect('COUNT(DISTINCT contain.orderId)', 'orderCount')
      .from(Book, 'book')
      .leftJoin(Contains, 'contain', 'contain.bookId = book.bookID')
      .leftJoin(Order, 'order', 'order.orderId = contain.orderId AND order.state >= 0')
      .groupBy('book.merchantId')
      .addGroupBy('book.bookID')
      .addGroupBy('book.name')
      .addGroupBy('book.ISBN')
      .addGroupBy('book.price'),
})
export class MerchantBookSalesView {
  @ViewColumn()
  merchantId: string;

  @ViewColumn()
  bookId: string;

  @ViewColumn()
  bookName: string;

  @ViewColumn()
  ISBN: string;

  @ViewColumn()
  price: number;

  @ViewColumn()
  totalQuantitySold: number;

  @ViewColumn()
  totalRevenue: number;

  @ViewColumn()
  orderCount: number;
}
