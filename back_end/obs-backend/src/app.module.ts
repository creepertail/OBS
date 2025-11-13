import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
// import { BooksModule } from '../../tem/book/books.module';
import { MemberModule } from './member/member.module';

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
      synchronize: true, // 暫時關閉自動同步，避免重複建表錯誤
      // 注意：當你新增或修改 Entity 時，需要改回 true 或手動執行 SQL
    }),
    UsersModule,
    // BooksModule,
    MemberModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
