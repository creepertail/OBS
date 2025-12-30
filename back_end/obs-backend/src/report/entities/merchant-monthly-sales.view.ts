// src/report/entities/merchant-monthly-sales.view.ts
import { ViewEntity, ViewColumn, DataSource } from 'typeorm';
import { Order } from '../../order/entities/order.entity';

/**
 * 商家月銷售統計視圖
 * 按商家和月份分組統計銷售資料
 */
@ViewEntity({
  expression: (dataSource: DataSource) =>
    dataSource
      .createQueryBuilder()
      .select('order.merchantId', 'merchantId')
      // 年份
      .addSelect('YEAR(order.orderDate)', 'year')
      // 月份
      .addSelect('MONTH(order.orderDate)', 'month')
      // 該月份的總銷售額
      .addSelect('SUM(order.totalPrice)', 'totalRevenue')
      // 該月份的總訂單數
      .addSelect('COUNT(order.orderId)', 'totalOrders')
      // 該月份的總售出數量
      .addSelect('SUM(order.totalQuantity)', 'totalQuantity')
      .from(Order, 'order')
      .where('order.state >= 0')
      .groupBy('order.merchantId')
      .addGroupBy('YEAR(order.orderDate)')
      .addGroupBy('MONTH(order.orderDate)'),
})
export class MerchantMonthlySalesView {
  @ViewColumn()
  merchantId: string;

  @ViewColumn()
  year: number;

  @ViewColumn()
  month: number;

  @ViewColumn()
  totalRevenue: number;

  @ViewColumn()
  totalOrders: number;

  @ViewColumn()
  totalQuantity: number;
}
