// src/report/report.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../order/entities/order.entity';
import { Contains } from '../order/entities/contains.entity';
import { Member } from '../member/entities/member.entity';
import { SalesReportQueryDto } from './dto/sales-report-query.dto';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Contains)
    private containsRepository: Repository<Contains>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  /**
   * 取得商家過去6個月的銷售摘要報表
   * 回傳每月銷售資料，包含總件數和總金額
   * @param merchantId - 商家 ID
   * @param query - 查詢參數（日期範圍）
   */
  async getMerchantSalesReport(merchantId: string, query: SalesReportQueryDto) {
    // 驗證商家是否存在
    const merchant = await this.memberRepository.findOne({
      where: { memberID: merchantId },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    // 計算過去6個月的日期範圍
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    startDate.setDate(1); // 從6個月前的第一天開始
    startDate.setHours(0, 0, 0, 0);

    // 建立過去6個月的查詢
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .where('order.merchantId = :merchantId', { merchantId })
      .andWhere('order.orderDate >= :startDate', { startDate })
      .andWhere('order.orderDate <= :endDate', { endDate });

    const orders = await queryBuilder.getMany();

    // 按月份分組訂單
    const monthlySales: Record<string, { month: string; totalQuantity: number; totalRevenue: number }> = {};

    // 初始化所有6個月的資料為零
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlySales[monthKey] = {
        month: monthKey,
        totalQuantity: 0,
        totalRevenue: 0,
      };
    }

    // 按月份匯總銷售資料
    orders.forEach(order => {
      const orderDate = new Date(order.orderDate);
      const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;

      if (monthlySales[monthKey]) {
        monthlySales[monthKey].totalQuantity += order.totalQuantity;
        monthlySales[monthKey].totalRevenue += order.totalPrice;
      }
    });

    // 轉換為陣列並按月份排序（從最舊到最新）
    const monthlySalesArray = Object.values(monthlySales)
      .sort((a, b) => a.month.localeCompare(b.month));

    // 計算整個6個月期間的總計
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalQuantity = orders.reduce((sum, order) => sum + order.totalQuantity, 0);
    const totalOrders = orders.length;

    return {
      merchantId,
      merchantName: merchant.merchantName,
      period: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        description: 'Past 6 months',
      },
      summary: {
        totalRevenue,
        totalQuantity,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
      },
      monthlySales: monthlySalesArray,
    };
  }

  /**
   * 取得商家的暢銷書籍
   * @param merchantId - 商家 ID
   * @param query - 查詢參數
   */
  async getBestSellingBooks(merchantId: string, query: SalesReportQueryDto) {
    const queryBuilder = this.containsRepository
      .createQueryBuilder('contain')
      .leftJoinAndSelect('contain.book', 'book')
      .leftJoin('contain.order', 'order')
      .where('order.merchantId = :merchantId', { merchantId });

    // 套用日期篩選條件
    if (query.startDate) {
      queryBuilder.andWhere('order.orderDate >= :startDate', {
        startDate: query.startDate,
      });
    }

    if (query.endDate) {
      queryBuilder.andWhere('order.orderDate <= :endDate', {
        endDate: query.endDate,
      });
    }

    const contains = await queryBuilder.getMany();

    // 匯總書籍銷售資料
    const bookSales = contains.reduce((acc, item) => {
      const bookId = item.bookId;
      if (!acc[bookId]) {
        acc[bookId] = {
          bookId,
          bookName: item.book?.name || 'Unknown',
          ISBN: item.book?.ISBN || 'Unknown',
          totalQuantitySold: 0,
          totalRevenue: 0,
        };
      }
      acc[bookId].totalQuantitySold += item.quantity;
      acc[bookId].totalRevenue += item.quantity * (item.book?.price || 0);
      return acc;
    }, {} as Record<string, any>);

    // 依總銷售數量排序並取前10名
    const topBooks = Object.values(bookSales)
      .sort((a, b) => b.totalQuantitySold - a.totalQuantitySold)
      .slice(0, 10);

    return topBooks;
  }

  /**
   * 取得依時間區間分組的銷售統計（日/週/月/年）
   * @param merchantId - 商家 ID
   * @param query - 查詢參數
   */
  async getSalesByPeriod(merchantId: string, query: SalesReportQueryDto) {
    // 驗證商家是否存在
    const merchant = await this.memberRepository.findOne({
      where: { memberID: merchantId },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .where('order.merchantId = :merchantId', { merchantId });

    // 套用日期篩選條件
    if (query.startDate) {
      queryBuilder.andWhere('order.orderDate >= :startDate', {
        startDate: query.startDate,
      });
    }

    if (query.endDate) {
      queryBuilder.andWhere('order.orderDate <= :endDate', {
        endDate: query.endDate,
      });
    }

    const orders = await queryBuilder.getMany();

    // 依時間區間分組
    const groupBy = query.groupBy || 'day';
    const salesByPeriod = orders.reduce((acc, order) => {
      const date = new Date(order.orderDate);
      let periodKey: string;

      switch (groupBy) {
        case 'year':
          periodKey = `${date.getFullYear()}`;
          break;
        case 'month':
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'week':
          const weekNumber = this.getWeekNumber(date);
          periodKey = `${date.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
          break;
        case 'day':
        default:
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          break;
      }

      if (!acc[periodKey]) {
        acc[periodKey] = {
          period: periodKey,
          revenue: 0,
          orders: 0,
          items: 0,
        };
      }

      acc[periodKey].revenue += order.totalPrice;
      acc[periodKey].orders += 1;
      acc[periodKey].items += order.totalQuantity;

      return acc;
    }, {} as Record<string, any>);

    // 轉換為陣列並依時間區間排序
    const result = Object.values(salesByPeriod).sort((a, b) =>
      a.period.localeCompare(b.period),
    );

    return {
      merchantId,
      merchantName: merchant.merchantName,
      groupBy,
      data: result,
    };
  }

  /**
   * 從日期計算週數
   * @param date - 日期物件
   */
  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
}
