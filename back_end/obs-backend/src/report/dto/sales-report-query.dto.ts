// src/report/dto/sales-report-query.dto.ts
import { IsOptional, IsDateString, IsIn } from 'class-validator';

export class SalesReportQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsIn(['day', 'week', 'month', 'year'])
  groupBy?: 'day' | 'week' | 'month' | 'year';
}
