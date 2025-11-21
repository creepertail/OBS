import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 啟用 CORS
  app.enableCors({
    origin: '*', // 允許所有來源（開發環境用，正式環境建議指定特定網址）
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 設定靜態檔案服務，讓上傳的圖片可以被存取
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', // URL 前綴，例如：http://localhost:3000/uploads/books/xxx.jpg
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
