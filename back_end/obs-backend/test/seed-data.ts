// test/seed-data.ts
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';
import { Member } from '../src/member/entities/member.entity';
import { MemberType } from '../src/member/member-type.enum';
import { Category } from '../src/category/entities/categories.entity';
import { Book } from '../src/book/entityies/book.entity';
import { BookImage } from '../src/book/entityies/book-image.entity';
import { BelongsTo } from '../src/belongs-to/entities/belongs-to.entity';

// 載入環境變數
config();

// 創建 DataSource
const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'OBS',
  entities: [Member, Category, Book, BookImage, BelongsTo],
  synchronize: false,
  logging: true,
});

async function seedData() {
  try {
    console.log('🚀 開始連接資料庫...');
    await AppDataSource.initialize();
    console.log('✅ 資料庫連接成功！');

    // 清空現有數據（可選）
    console.log('\n🗑️  清空現有測試數據...');
    // 暫時禁用外鍵檢查，以便清空資料
    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    await AppDataSource.getRepository(BelongsTo).clear();
    await AppDataSource.getRepository(BookImage).clear();
    await AppDataSource.getRepository(Book).clear();
    await AppDataSource.getRepository(Category).clear();
    await AppDataSource.getRepository(Member).clear();
    // 重新啟用外鍵檢查
    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ 清空完成！');

    // 1. 創建會員（用戶和商家）
    console.log('\n👤 創建會員數據...');
    const memberRepo = AppDataSource.getRepository(Member);

    // 創建商家
    const merchant1 = await memberRepo.save({
      email: 'merchant1@gmail.com',
      account: 'merchant1',
      password: await bcrypt.hash('0000', 10),
      phoneNumber: '0912345001',
      type: MemberType.Merchant,
      merchantName: '博客來書店',
      merchantAddress: '台北市中正區重慶南路一段121號',
      merchantState: 0,
      merchantSubscriberCount: 0,
    });

    const merchant2 = await memberRepo.save({
      email: 'merchant2@gmail.com',
      account: 'merchant2',
      password: await bcrypt.hash('0000', 10),
      phoneNumber: '0912345002',
      type: MemberType.Merchant,
      merchantName: '誠品書店',
      merchantAddress: '台北市信義區松高路11號',
      merchantState: 0,
      merchantSubscriberCount: 0,
    });

    const merchant3 = await memberRepo.save({
      email: 'merchant3@gmail.com',
      account: 'merchant3',
      password: await bcrypt.hash('0000', 10),
      phoneNumber: '0912345003',
      type: MemberType.Merchant,
      merchantName: '金石堂書店',
      merchantAddress: '台北市大安區復興南路一段245號',
      merchantState: 0,
      merchantSubscriberCount: 0,
    });

    // 創建管理員
    const admin = await memberRepo.save({
      email: 'admin@gmail.com',
      account: 'admin',
      password: await bcrypt.hash('0000', 10),
      phoneNumber: '0900000000',
      type: MemberType.Admin,
    });

    // 創建普通用戶
    const user1 = await memberRepo.save({
      email: 'user1@gmail.com',
      account: 'user1',
      password: await bcrypt.hash('0000', 10),
      phoneNumber: '0923456001',
      type: MemberType.User,
      userName: '張小明',
      userLevel: 2,
      userState: 0,
    });

    const user2 = await memberRepo.save({
      email: 'user2@gmail.com',
      account: 'user2',
      password: await bcrypt.hash('0000', 10),
      phoneNumber: '0923456002',
      type: MemberType.User,
      userName: '李小華',
      userLevel: 1,
      userState: 0,
    });

    const user3 = await memberRepo.save({
      email: 'user3@gmail.com',
      account: 'user3',
      password: await bcrypt.hash('0000', 10),
      phoneNumber: '0923456003',
      type: MemberType.User,
      userName: '王小美',
      userLevel: 3,
      userState: 0,
    });

    console.log('✅ 創建了 7 個會員（3 商家、1 管理員、3 用戶）');

    // 2. 創建分類
    console.log('\n📚 創建分類數據...');
    const categoryRepo = AppDataSource.getRepository(Category);

    const categories = await categoryRepo.save([
      {
        name: '程式設計',
        description: '程式語言、軟體開發、演算法等相關書籍',
      },
      {
        name: '商業管理',
        description: '企業管理、行銷、財務等商業相關書籍',
      },
      {
        name: '文學小說',
        description: '各類文學作品、小說、散文集',
      },
      {
        name: '心理勵志',
        description: '心理學、自我成長、勵志類書籍',
      },
      {
        name: '藝術設計',
        description: '設計、繪畫、攝影等藝術相關書籍',
      },
      {
        name: '科學科普',
        description: '科學知識、科普讀物',
      },
      {
        name: '語言學習',
        description: '外語學習、語言教材',
      },
      {
        name: '旅遊',
        description: '旅遊指南、遊記',
      },
    ]);

    console.log(`✅ 創建了 ${categories.length} 個分類`);

    // 3. 創建書籍
    console.log('\n📖 創建書籍數據...');
    const bookRepo = AppDataSource.getRepository(Book);
    const bookImageRepo = AppDataSource.getRepository(BookImage);
    const belongsToRepo = AppDataSource.getRepository(BelongsTo);

    // 程式設計類書籍
    const book1 = await bookRepo.save({
      ISBN: '9789571234567',
      name: 'Node.js 實戰開發',
      productDescription: '深入淺出學習 Node.js 後端開發，從零開始打造企業級應用。本書涵蓋 Express、資料庫整合、RESTful API 設計等核心主題。',
      price: 450,
      inventoryQuantity: 100,
      status: 1,
      author: '張三',
      publisher: '碁峰資訊',
      merchantId: merchant1.memberID,
    });

    await bookImageRepo.save([
      {
        imageUrl: 'https://via.placeholder.com/300x400/4A90E2/ffffff?text=Node.js',
        displayOrder: 0,
        isCover: true,
        book: book1,
      },
      {
        imageUrl: 'https://via.placeholder.com/300x400/4A90E2/ffffff?text=Back',
        displayOrder: 1,
        isCover: false,
        book: book1,
      },
    ]);

    await belongsToRepo.save({
      bookID: book1.bookID,
      categoryId: categories[0].categoryID,
    });

    const book2 = await bookRepo.save({
      ISBN: '9787115556789',
      name: 'TypeScript 完全指南',
      productDescription: 'TypeScript 從入門到精通，掌握現代前端開發技術。包含型別系統、裝飾器、泛型等進階主題。',
      price: 520,
      inventoryQuantity: 75,
      status: 1,
      author: '李四',
      publisher: '電子工業出版社',
      merchantId: merchant1.memberID,
    });

    await bookImageRepo.save([
      {
        imageUrl: 'https://via.placeholder.com/300x400/50C878/ffffff?text=TypeScript',
        displayOrder: 0,
        isCover: true,
        book: book2,
      },
    ]);

    await belongsToRepo.save({
      bookID: book2.bookID,
      categoryId: categories[0].categoryID,
    });

    const book3 = await bookRepo.save({
      ISBN: '9789864344567',
      name: 'React 全面解析',
      productDescription: '全面掌握 React 18 最新特性，包含 Hooks、Context、Redux 狀態管理、效能優化等實戰技巧。',
      price: 580,
      inventoryQuantity: 60,
      status: 1,
      author: '王五',
      publisher: '旗標出版',
      merchantId: merchant2.memberID,
    });

    await bookImageRepo.save([
      {
        imageUrl: 'https://via.placeholder.com/300x400/61DAFB/000000?text=React',
        displayOrder: 0,
        isCover: true,
        book: book3,
      },
    ]);

    await belongsToRepo.save({
      bookID: book3.bookID,
      categoryId: categories[0].categoryID,
    });

    // 商業管理類書籍
    const book4 = await bookRepo.save({
      ISBN: '9789573285540',
      name: '精實創業',
      productDescription: '如何運用精實創業方法快速驗證商業模式，降低創業風險。創業者必讀經典。',
      price: 380,
      inventoryQuantity: 120,
      status: 1,
      author: 'Eric Ries',
      publisher: '遠流出版',
      merchantId: merchant2.memberID,
    });

    await bookImageRepo.save([
      {
        imageUrl: 'https://via.placeholder.com/300x400/FF6B6B/ffffff?text=Lean+Startup',
        displayOrder: 0,
        isCover: true,
        book: book4,
      },
    ]);

    await belongsToRepo.save({
      bookID: book4.bookID,
      categoryId: categories[1].categoryID,
    });

    const book5 = await bookRepo.save({
      ISBN: '9789864777235',
      name: '從 0 到 1：打開世界運作的未知秘密',
      productDescription: 'PayPal 創辦人 Peter Thiel 分享創業心法，如何在競爭中創造獨特價值。',
      price: 360,
      inventoryQuantity: 90,
      status: 1,
      author: 'Peter Thiel',
      publisher: '天下雜誌',
      merchantId: merchant3.memberID,
    });

    await bookImageRepo.save([
      {
        imageUrl: 'https://via.placeholder.com/300x400/FFA500/ffffff?text=Zero+to+One',
        displayOrder: 0,
        isCover: true,
        book: book5,
      },
    ]);

    await belongsToRepo.save({
      bookID: book5.bookID,
      categoryId: categories[1].categoryID,
    });

    // 文學小說類書籍
    const book6 = await bookRepo.save({
      ISBN: '9789573337584',
      name: '人生自古誰不廢',
      productDescription: '暢銷作家敏鎬的最新作品，用幽默筆觸描繪現代人的生活困境與自我探索。',
      price: 320,
      inventoryQuantity: 150,
      status: 1,
      author: '金敏鎬',
      publisher: '圓神出版',
      merchantId: merchant1.memberID,
    });

    await bookImageRepo.save([
      {
        imageUrl: 'https://via.placeholder.com/300x400/9B59B6/ffffff?text=Novel',
        displayOrder: 0,
        isCover: true,
        book: book6,
      },
    ]);

    await belongsToRepo.save({
      bookID: book6.bookID,
      categoryId: categories[2].categoryID,
    });

    // 心理勵志類書籍
    const book7 = await bookRepo.save({
      ISBN: '9789869596336',
      name: '原子習慣',
      productDescription: '細微改變帶來巨大成就的實證法則。每天進步 1%，一年後你會進步 37 倍！',
      price: 330,
      inventoryQuantity: 200,
      status: 1,
      author: 'James Clear',
      publisher: '方智出版',
      merchantId: merchant2.memberID,
    });

    await bookImageRepo.save([
      {
        imageUrl: 'https://via.placeholder.com/300x400/3498DB/ffffff?text=Atomic+Habits',
        displayOrder: 0,
        isCover: true,
        book: book7,
      },
    ]);

    await belongsToRepo.save({
      bookID: book7.bookID,
      categoryId: categories[3].categoryID,
    });

    const book8 = await bookRepo.save({
      ISBN: '9789863594475',
      name: '刻意練習',
      productDescription: '原創者全面解析，比天賦更關鍵的學習法。任何人都可以透過正確的練習方法成為專家。',
      price: 360,
      inventoryQuantity: 110,
      status: 1,
      author: 'Anders Ericsson',
      publisher: '方智出版',
      merchantId: merchant3.memberID,
    });

    await bookImageRepo.save([
      {
        imageUrl: 'https://via.placeholder.com/300x400/E74C3C/ffffff?text=Peak',
        displayOrder: 0,
        isCover: true,
        book: book8,
      },
    ]);

    await belongsToRepo.save({
      bookID: book8.bookID,
      categoryId: categories[3].categoryID,
    });

    // 藝術設計類書籍
    const book9 = await bookRepo.save({
      ISBN: '9789571375823',
      name: '設計的法則',
      productDescription: '125 個影響認知、增加美感的關鍵法則。設計師與創意工作者必備參考書。',
      price: 480,
      inventoryQuantity: 65,
      status: 1,
      author: 'William Lidwell',
      publisher: '時報出版',
      merchantId: merchant1.memberID,
    });

    await bookImageRepo.save([
      {
        imageUrl: 'https://via.placeholder.com/300x400/F39C12/ffffff?text=Design',
        displayOrder: 0,
        isCover: true,
        book: book9,
      },
    ]);

    await belongsToRepo.save({
      bookID: book9.bookID,
      categoryId: categories[4].categoryID,
    });

    // 科學科普類書籍
    const book10 = await bookRepo.save({
      ISBN: '9789571368641',
      name: '人類大歷史',
      productDescription: '從野獸到扮演上帝。暢銷全球的人類簡史，重新思考人類文明的發展軌跡。',
      price: 450,
      inventoryQuantity: 130,
      status: 1,
      author: 'Yuval Noah Harari',
      publisher: '天下文化',
      merchantId: merchant2.memberID,
    });

    await bookImageRepo.save([
      {
        imageUrl: 'https://via.placeholder.com/300x400/16A085/ffffff?text=Sapiens',
        displayOrder: 0,
        isCover: true,
        book: book10,
      },
    ]);

    await belongsToRepo.save({
      bookID: book10.bookID,
      categoryId: categories[5].categoryID,
    });

    // 語言學習類書籍
    const book11 = await bookRepo.save({
      ISBN: '9789575324765',
      name: '英文寫作聖經',
      productDescription: '《The Elements of Style》中文版，英文寫作的必備經典，讓你的英文寫作更精準有力。',
      price: 280,
      inventoryQuantity: 95,
      status: 1,
      author: 'William Strunk Jr.',
      publisher: '五南出版',
      merchantId: merchant3.memberID,
    });

    await bookImageRepo.save([
      {
        imageUrl: 'https://via.placeholder.com/300x400/2ECC71/ffffff?text=English',
        displayOrder: 0,
        isCover: true,
        book: book11,
      },
    ]);

    await belongsToRepo.save({
      bookID: book11.bookID,
      categoryId: categories[6].categoryID,
    });

    // 旅遊類書籍
    const book12 = await bookRepo.save({
      ISBN: '9789864084067',
      name: '日本深度旅遊',
      productDescription: '超過 200 個日本私房景點，帶你深入探索日本文化與美食，規劃最完美的日本之旅。',
      price: 420,
      inventoryQuantity: 80,
      status: 1,
      author: '陳美娟',
      publisher: '墨刻出版',
      merchantId: merchant1.memberID,
    });

    await bookImageRepo.save([
      {
        imageUrl: 'https://via.placeholder.com/300x400/E67E22/ffffff?text=Travel+Japan',
        displayOrder: 0,
        isCover: true,
        book: book12,
      },
    ]);

    await belongsToRepo.save({
      bookID: book12.bookID,
      categoryId: categories[7].categoryID,
    });

    // 創建一本庫存較少的書（測試缺貨情況）
    const book13 = await bookRepo.save({
      ISBN: '9789862139585',
      name: 'Python 深度學習',
      productDescription: '使用 TensorFlow 和 Keras 構建深度學習模型，從基礎到實戰應用。',
      price: 680,
      inventoryQuantity: 5,
      status: 1,
      author: 'François Chollet',
      publisher: '博碩文化',
      merchantId: merchant2.memberID,
    });

    await bookImageRepo.save([
      {
        imageUrl: 'https://via.placeholder.com/300x400/8E44AD/ffffff?text=Deep+Learning',
        displayOrder: 0,
        isCover: true,
        book: book13,
      },
    ]);

    await belongsToRepo.save({
      bookID: book13.bookID,
      categoryId: categories[0].categoryID,
    });

    // 創建一本已下架的書（測試下架狀態）
    const book14 = await bookRepo.save({
      ISBN: '9789571359564',
      name: 'JavaScript 基礎教程（舊版）',
      productDescription: '這是舊版的 JavaScript 教程，已被新版取代。',
      price: 350,
      inventoryQuantity: 0,
      status: 0, // 已下架
      author: '趙六',
      publisher: '旗標出版',
      merchantId: merchant3.memberID,
    });

    await bookImageRepo.save([
      {
        imageUrl: 'https://via.placeholder.com/300x400/95A5A6/ffffff?text=Old+Version',
        displayOrder: 0,
        isCover: true,
        book: book14,
      },
    ]);

    await belongsToRepo.save({
      bookID: book14.bookID,
      categoryId: categories[0].categoryID,
    });

    // 創建一本多分類的書
    const book15 = await bookRepo.save({
      ISBN: '9789863207290',
      name: '設計師的 UI/UX 入門課',
      productDescription: '結合設計美學與程式實作，打造優秀的使用者介面與體驗。適合設計師與前端工程師。',
      price: 520,
      inventoryQuantity: 70,
      status: 1,
      author: '林小雅',
      publisher: '碁峰資訊',
      merchantId: merchant1.memberID,
    });

    await bookImageRepo.save([
      {
        imageUrl: 'https://via.placeholder.com/300x400/1ABC9C/ffffff?text=UI+UX',
        displayOrder: 0,
        isCover: true,
        book: book15,
      },
    ]);

    // 這本書同時屬於程式設計和藝術設計分類
    await belongsToRepo.save([
      {
        bookID: book15.bookID,
        categoryId: categories[0].categoryID,
      },
      {
        bookID: book15.bookID,
        categoryId: categories[4].categoryID,
      },
    ]);

    console.log('✅ 創建了 15 本書籍');

    // 顯示統計資訊
    console.log('\n📊 數據統計：');
    console.log('─────────────────────────────');
    console.log(`👥 會員總數：${await memberRepo.count()}`);
    console.log(`   - 商家：${await memberRepo.count({ where: { type: MemberType.Merchant } })}`);
    console.log(`   - 用戶：${await memberRepo.count({ where: { type: MemberType.User } })}`);
    console.log(`   - 管理員：${await memberRepo.count({ where: { type: MemberType.Admin } })}`);
    console.log(`📚 分類總數：${await categoryRepo.count()}`);
    console.log(`📖 書籍總數：${await bookRepo.count()}`);
    console.log(`   - 上架：${await bookRepo.count({ where: { status: 1 } })}`);
    console.log(`   - 下架：${await bookRepo.count({ where: { status: 0 } })}`);
    console.log(`🖼️  圖片總數：${await bookImageRepo.count()}`);
    console.log(`🔗 分類關聯數：${await belongsToRepo.count()}`);
    console.log('─────────────────────────────');

    console.log('\n🎉 測試數據生成完成！');
    console.log('\n📝 測試帳號資訊：');
    console.log('─────────────────────────────');
    console.log('🏪 商家帳號：');
    console.log('  merchant1 / 0000');
    console.log('  merchant2 / 0000');
    console.log('  merchant3 / 0000');
    console.log('\n👤 用戶帳號：');
    console.log('  user1 / 0000');
    console.log('  user2 / 0000');
    console.log('  user3 / 0000');
    console.log('\n🔐 管理員帳號：');
    console.log('  admin / 0000');
    console.log('─────────────────────────────');
  } catch (error) {
    console.error('❌ 錯誤：', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('\n✅ 資料庫連接已關閉');
    }
  }
}

// 執行腳本
seedData();
