import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { BooksModule } from './book/books.module';
import { MemberModule } from './member/member.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { CategoryModule } from './category/category.module';
import { BelongsToModule } from './belongs-to/belongs-to.module';
import { OrderModule } from './order/order.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'OBS',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],  // 這行會自動掃描所有 .entity.ts 檔案
      synchronize: false, // 關閉自動同步，避免重複建表錯誤
      // 注意：當你新增或修改 Entity 時，需要手動執行 SQL 或使用 migration
      // logging: ['query', 'error', 'schema'],
    }),
    UsersModule,
    BooksModule,
    MemberModule,
    SubscriptionModule,
    CategoryModule,
    BelongsToModule,
    OrderModule,
    CartModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
