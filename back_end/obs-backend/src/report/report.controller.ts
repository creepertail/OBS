// src/report/report.controller.ts
import { Controller, Get, Param, Query, Request, ForbiddenException } from '@nestjs/common';
import { ReportService } from './report.service';
import { SalesReportQueryDto } from './dto/sales-report-query.dto';
import { JWTGuard } from '../member/decorators/jwt-guard.decorator';
import { MemberType } from '../member/member-type.enum';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  /**
   * 取得商家自己的銷售摘要報表（快捷方式）
   * 商家只能查看自己的報表
   *
   * GET /reports/merchants/sales
   */
  @Get('merchants/sales')
  @JWTGuard(MemberType.Merchant)
  async getMerchantSalesReport(
    @Query() query: SalesReportQueryDto,
    @Request() req,
  ) {
    const merchantId = req.member.sub;
    return this.reportService.getMerchantSalesReport(merchantId, query);
  }

  /**
   * 依商家 ID 取得銷售摘要報表
   * 商家只能查看自己的報表
   * 管理員可以查看任何商家的報表
   *
   * GET /reports/merchants/:merchantId/sales
   */
  @Get('merchants/:merchantId/sales')
  @JWTGuard(MemberType.Merchant, MemberType.Admin)
  async getMerchantSalesReportByMerchantID(
    @Param('merchantId') merchantId: string,
    @Query() query: SalesReportQueryDto,
    @Request() req,
  ) {
    const requesterId = req.member.sub;
    const requesterType = req.member.type;

    // 商家只能查看自己的報表
    if (requesterType === MemberType.Merchant && requesterId !== merchantId) {
      throw new ForbiddenException('You can only view your own sales report');
    }

    return this.reportService.getMerchantSalesReport(merchantId, query);
  }

  /**
   * 取得商家自己的銷售報表（當前商家的快捷方式）
   *
   * GET /reports/sales
   */
  @Get('sales')
  @JWTGuard(MemberType.Merchant)
  async getOwnSalesReport(@Query() query: SalesReportQueryDto, @Request() req) {
    const merchantId = req.member.sub;
    return this.reportService.getMerchantSalesReport(merchantId, query);
  }

  /**
   * 取得商家的暢銷書籍
   *
   * GET /reports/merchants/:merchantId/best-sellers
   */
  @Get('merchants/:merchantId/best-sellers')
  @JWTGuard(MemberType.Merchant, MemberType.Admin)
  async getBestSellingBooks(
    @Param('merchantId') merchantId: string,
    @Query() query: SalesReportQueryDto,
    @Request() req,
  ) {
    const requesterId = req.member.sub;
    const requesterType = req.member.type;

    // 商家只能查看自己的報表
    if (requesterType === MemberType.Merchant && requesterId !== merchantId) {
      throw new ForbiddenException('You can only view your own best sellers');
    }

    return this.reportService.getBestSellingBooks(merchantId, query);
  }

  /**
   * 取得依時間區間分組的銷售統計
   *
   * GET /reports/merchants/:merchantId/sales-by-period
   */
  @Get('merchants/:merchantId/sales-by-period')
  @JWTGuard(MemberType.Merchant, MemberType.Admin)
  async getSalesByPeriod(
    @Param('merchantId') merchantId: string,
    @Query() query: SalesReportQueryDto,
    @Request() req,
  ) {
    const requesterId = req.member.sub;
    const requesterType = req.member.type;

    // 商家只能查看自己的報表
    if (requesterType === MemberType.Merchant && requesterId !== merchantId) {
      throw new ForbiddenException('You can only view your own sales by period');
    }

    return this.reportService.getSalesByPeriod(merchantId, query);
  }
}
