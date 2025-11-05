import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
      synchronize: true, // 開發時使用，正式環境要改為 false
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}