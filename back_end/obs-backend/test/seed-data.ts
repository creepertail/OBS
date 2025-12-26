// test/seed-data.ts
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { Member } from '../src/member/entities/member.entity';
import { MemberType } from '../src/member/member-type.enum';
import { Category } from '../src/category/entities/categories.entity';
import { Book } from '../src/book/entities/book.entity';
import { BookImage } from '../src/book/entities/book-image.entity';
import { BelongsTo } from '../src/belongs-to/entities/belongs-to.entity';
import { Order } from '../src/order/entities/order.entity';
import { Contains } from '../src/order/entities/contains.entity';
import { AddsToCart } from '../src/cart/entities/adds-to-cart.entity';
import { Coupon } from '../src/coupon/entities/coupon.entity';
import { Claim } from '../src/claims/entities/claim.entity';
import { Manage } from '../src/manage/entities/manage.entity';

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
  entities: [Member, Category, Book, BookImage, BelongsTo, Order, Contains, AddsToCart, Coupon, Claim, Manage],
  synchronize: false,
  logging: true,
});

async function seedData() {
  // 輔助函數：複製圖片到 uploads 資料夾並回傳 URL
  const copyImageToUploads = (sourceRelativePath: string): string => {
    const sourcePath = path.join(__dirname, sourceRelativePath);
    const uploadsDir = path.join(__dirname, '../uploads/books');

    // 確保 uploads/books 資料夾存在
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 檢查來源檔案是否存在
    if (!fs.existsSync(sourcePath)) {
      console.warn(`⚠️  警告：圖片檔案不存在：${sourcePath}`);
      return '';
    }

    // 產生唯一檔名（與上傳 API 格式一致）
    const ext = path.extname(sourcePath);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `book-${uniqueSuffix}${ext}`;
    const destPath = path.join(uploadsDir, filename);

    // 複製檔案
    try {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ 已複製圖片：${sourceRelativePath} -> ${filename}`);
    } catch (error) {
      console.error(`❌ 複製圖片失敗：${sourceRelativePath}`, error);
      return '';
    }

    // 回傳完整 URL（與上傳 API 格式一致）
    return `http://localhost:3000/uploads/books/${filename}`;
  };

  try {
    console.log('🚀 開始連接資料庫...');
    await AppDataSource.initialize();
    console.log('✅ 資料庫連接成功！');

    console.log('\n📸 準備複製本地圖片到 uploads/books 資料夾...');

    // 清空現有數據（可選）
    console.log('\n🗑️  清空現有測試數據...');
    // 暫時禁用外鍵檢查，以便清空資料
    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    await AppDataSource.getRepository(Claim).clear();
    await AppDataSource.getRepository(Contains).clear();
    await AppDataSource.getRepository(Manage).clear();
    await AppDataSource.getRepository(Order).clear();
    await AppDataSource.getRepository(BelongsTo).clear();
    await AppDataSource.getRepository(BookImage).clear();
    await AppDataSource.getRepository(Book).clear();
    await AppDataSource.getRepository(Coupon).clear();
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
    const couponRepo = AppDataSource.getRepository(Coupon);
    const claimRepo = AppDataSource.getRepository(Claim);

    // 優惠券範例
    const coupon1 = await couponRepo.save({
      amount: 100,
      validDate: new Date('2025-12-31T00:00:00Z'),
      discount: 0.9,
      description: 'merchant1 年末折扣券',
      redemptionCode: 'MERCHANT1-NEWYEAR-90',
      memberID: merchant1.memberID,
    });

    const coupon2 = await couponRepo.save({
      amount: 50,
      validDate: new Date('2025-10-31T00:00:00Z'),
      discount: 0.8,
      description: 'merchant2 新客八折券',
      redemptionCode: 'MERCHANT2-WELCOME-80',
      memberID: merchant2.memberID,
    });

    await claimRepo.save([
      { userID: user1.memberID, couponID: coupon1.couponID, state: 0 },
      { userID: user2.memberID, couponID: coupon1.couponID, state: 0 },
      { userID: user3.memberID, couponID: coupon2.couponID, state: 0 },
    ]);

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
      {
        name: '其他',
        description: '其他',
      },
    ]);

    console.log(`✅ 創建了 ${categories.length} 個分類`);

    // 3. 創建書籍
    console.log('\n📖 創建書籍數據...');
    const bookRepo = AppDataSource.getRepository(Book);
    const bookImageRepo = AppDataSource.getRepository(BookImage);
    const belongsToRepo = AppDataSource.getRepository(BelongsTo);

    // 第一本 - 程式設計類
    const book1 = await bookRepo.save({
      ISBN: '9786263294622',
      name: '電腦&程式設計知識圖鑑: 0基礎也好懂! 科技素養與邏輯力躍進的第一步!',
      productDescription: 'AI時代不可不知的知識\n' +
        'AI是什麼？究竟什麼是程式設計？' +
        '程式語言有何區別？' +
        '最輕鬆、易懂的電腦＆程式設計圖鑑！',
      price: 360,
      inventoryQuantity: 100,
      status: 1,
      author: '石戶奈奈子/ 監修',
      publisher: '台灣東販股份有限公司',
      merchantId: merchant1.memberID,
    });

    await bookImageRepo.save([
      {
        imageUrl: copyImageToUploads('BookImage-Demo/1/1.jpg'),
        displayOrder: 0,
        isCover: true,
        book: book1,
      },
      {
        imageUrl: copyImageToUploads('BookImage-Demo/1/2.jpg'),
        displayOrder: 1,
        isCover: false,
        book: book1,
      },
      {
        imageUrl: copyImageToUploads('BookImage-Demo/1/3.jpg'),
        displayOrder: 2,
        isCover: false,
        book: book1,
      },
      {
        imageUrl: copyImageToUploads('BookImage-Demo/1/4.jpg'),
        displayOrder: 3,
        isCover: false,
        book: book1,
      },
      {
        imageUrl: copyImageToUploads('BookImage-Demo/1/5.jpg'),
        displayOrder: 4,
        isCover: false,
        book: book1,
      },
      {
        imageUrl: copyImageToUploads('BookImage-Demo/1/6.jpg'),
        displayOrder: 5,
        isCover: false,
        book: book1,
      },
    ]);

    await belongsToRepo.save({
      bookID: book1.bookID,
      categoryId: categories[0].categoryID,
    });

    // 第二本 - 商業管理
    const book2 = await bookRepo.save({
      ISBN: '9786263439894',
      name: '商業管理萃思 (TRIZ)理論與實務: 讓你發明新的服務',
      productDescription: '商業管理萃思是一種從傳統技術萃思（TRIZ）理論轉化調整，使更適用於商業管理情境問題處理的系統化創新方法，可以說是系統化的商業管理創新方法，也可以說是一種讓你發明新服務的方法。系統化商業管理創新是將商業管理創新結構化，建立一系列的流程步驟以完成商業管理創新的任務。目前這種方法問世將近20年，是...',
      price: 540,
      inventoryQuantity: 75,
      status: 1,
      author: '林永禎',
      publisher: '五南圖書出版股份有限公司',
      merchantId: merchant1.memberID,
    });

    await bookImageRepo.save([
      {
        imageUrl: copyImageToUploads('BookImage-Demo/2/1.jpg'),
        displayOrder: 0,
        isCover: true,
        book: book2,
      },
      {
        imageUrl: copyImageToUploads('BookImage-Demo/2/2.jpg'),
        displayOrder: 1,
        isCover: false,
        book: book2,
      },
      {
        imageUrl: copyImageToUploads('BookImage-Demo/2/3.jpg'),
        displayOrder: 2,
        isCover: false,
        book: book2,
      },
    ]);

    await belongsToRepo.save({
      bookID: book2.bookID,
      categoryId: categories[1].categoryID,
    });

    // 第三本 - 文學小說
    const book3 = await bookRepo.save({
      ISBN: '9789864344567',
      name: '臺灣原住民文學選集．小說 4冊套書 (4冊合售)',
      productDescription: '睽違20年，新編．臺灣原住民文學選集\n' +
        ' 原住民族委員會 × 山海文化雜誌30週年 × 聯經出版 50 週年',
      price: 1300,
      inventoryQuantity: 60,
      status: 1,
      author: '孫大川',
      publisher: '聯經出版事業股份有限公司',
      merchantId: merchant2.memberID,
    });

    for (let i = 0; i < 10; i++) {
      await bookImageRepo.save({
        imageUrl: copyImageToUploads(`BookImage-Demo/3/${i + 1}.jpg`),
        displayOrder: i,
        isCover: i === 0,
        book: book3,
      });
    }

    await belongsToRepo.save({
      bookID: book3.bookID,
      categoryId: categories[2].categoryID,
    });

    // 第四本 - 心理勵志
    const book4 = await bookRepo.save({
      ISBN: '9786267074220',
      name: '一日一樹一故事: 每天用一棵樹讓自己沉浸在大自然裡',
      productDescription: '本書是獻給所有大自然愛好者的最佳禮物！\n' +
        '這是一本關於樹木與人的故事，也是一本樹的日曆\n' +
        '一年有365天，四季有春夏秋冬的變化，從1月到12月',
      price: 149,
      inventoryQuantity: 120,
      status: 1,
      author: '艾米-珍．必爾',
      publisher: '本事出版',
      merchantId: merchant2.memberID,
    });

    for (let i = 0; i < 5; i++) {
      await bookImageRepo.save({
        imageUrl: copyImageToUploads(`BookImage-Demo/4/${i + 1}.jpg`),
        displayOrder: i,
        isCover: i === 0,
        book: book4,
      });
    }

    await belongsToRepo.save({
      bookID: book4.bookID,
      categoryId: categories[3].categoryID,
    });

    // 第五本 - 藝術設計
    const book5 = await bookRepo.save({
      ISBN: '9789571182612',
      name: '藝術設計這回事',
      productDescription: '史論結合、以論為主。\n' +
        '按照藝術設計的歷史流變考察其理論形態。\n' +
        '闡述藝術設計按其自身的邏輯發展的理論。\n' +
        '視覺傳達設計、環境設計和產品設計重要的根基。',
      price: 300,
      inventoryQuantity: 90,
      status: 1,
      author: '凌繼堯',
      publisher: '五南圖書出版股份有限公司',
      merchantId: merchant3.memberID,
    });

    await bookImageRepo.save([
      {
        imageUrl: copyImageToUploads('BookImage-Demo/5/1.jpg'),
        displayOrder: 0,
        isCover: true,
        book: book5,
      },
    ]);

    await belongsToRepo.save({
      bookID: book5.bookID,
      categoryId: categories[4].categoryID,
    });

    // 第六本 - 科學科普
    const book6 = await bookRepo.save({
      ISBN: '9789573537584',
      name: '小小科學人每天10分鐘200個科普大發現: 科學、數碼 (2冊合售)',
      productDescription: '100% 超酷知識 X 100% 幽默好玩 X 100% 難以忘記暢銷全球的小小科學人系列\n' +
        '每本書囊括100個有趣知識主題，\n' +
        '每天只要10分鐘',
      price: 758,
      inventoryQuantity: 150,
      status: 1,
      author: '張容瑱(譯者)',
      publisher: '小天下出版',
      merchantId: merchant2.memberID,
    });

    for (let i = 0; i < 6; i++) {
      await bookImageRepo.save({
        imageUrl: copyImageToUploads(`BookImage-Demo/6/${i + 1}.jpg`),
        displayOrder: i,
        isCover: i === 0,
        book: book6,
      });
    }

    await belongsToRepo.save({
      bookID: book6.bookID,
      categoryId: categories[5].categoryID,
    });

    // 第七本 - 語言學習
    const book7 = await bookRepo.save({
      ISBN: '9789861755458',
      name: '學外語就像學母語: 25語台灣郎的沉浸式語言習得',
      productDescription: '這位土生土長的台灣郎，竟會說25種語言？！' +
        '多語達人Terry親身試驗，歸納出人人都能學會外語的終極方法，' +
        '比起上語言課、出國留學、定居國外，更經濟實惠、快速，保證100%有效！',
      price: 330,
      inventoryQuantity: 200,
      status: 1,
      author: 'Terry (謝智翔)',
      publisher: '方智出版社股份有限公司',
      merchantId: merchant2.memberID,
    });

    for (let i = 0; i < 6; i++) {
      await bookImageRepo.save({
        imageUrl: copyImageToUploads(`BookImage-Demo/7/${i + 1}.jpg`),
        displayOrder: i,
        isCover: i === 0,
        book: book7,
      });
    }

    await belongsToRepo.save({
      bookID: book7.bookID,
      categoryId: categories[6].categoryID,
    });

    // 第八本 - 旅遊
    const book8 = await bookRepo.save({
      ISBN: '9789863594475',
      name: '環遊世界200國: 一本帶你走遍世界的旅遊書 (最新版)',
      productDescription: '準備好開始一場令人難以置信、充滿刺激的旅程，跨越我們的地球。這本書會以洲為單位，帶你走遍世界上的每個國家。' +
        '涵蓋了成千上萬從神奇的動物、壯麗的景點、有趣的節慶到美味的食物，本書是用來了解我們多樣與',
      price: 380,
      inventoryQuantity: 110,
      status: 1,
      author: 'Malcolm Croft',
      publisher: '五南圖書出版股份有限公司',
      merchantId: merchant3.memberID,
    });

    await bookImageRepo.save([
      {
        imageUrl: copyImageToUploads('BookImage-Demo/8/1.jpg'),
        displayOrder: 0,
        isCover: true,
        book: book8,
      },
    ]);

    await belongsToRepo.save({
      bookID: book8.bookID,
      categoryId: categories[7].categoryID,
    });

    // 第九本 - 其他 運動
    const book9 = await bookRepo.save({
      ISBN: '9786263204133',
      name: '運動中的物理學: 用物理角度解讀44項運動競技, 讓你紀錄再突破! 看賽事更有趣!',
      productDescription: '兼具趣味與實用性的物理知識，讓你找到運動技能的訣竅',
      price: 280,
      inventoryQuantity: 65,
      status: 1,
      author: '望月修',
      publisher: '晨星出版有限公司',
      merchantId: merchant1.memberID,
    });

    for (let i = 0; i < 6; i++) {
      await bookImageRepo.save({
        imageUrl: copyImageToUploads(`BookImage-Demo/9/${i + 1}.jpg`),
        displayOrder: i,
        isCover: i === 0,
        book: book9,
      });
    }

    await belongsToRepo.save({
      bookID: book9.bookID,
      categoryId: categories[8].categoryID,
    });


    // 創建一本已下架的書（測試下架狀態）
    const book10 = await bookRepo.save({
      ISBN: '9789571359564',
      name: 'JavaScript 基礎教程（舊版）',
      productDescription: '這是舊版的 JavaScript 教程，已被新版取代。',
      price: 350,
      inventoryQuantity: 0,
      status: 1,  //上架但沒庫存
      author: '趙六',
      publisher: '旗標出版',
      merchantId: merchant3.memberID,
    });


    await belongsToRepo.save({
      bookID: book10.bookID,
      categoryId: categories[8].categoryID,
    });

    // 創建一本多分類的書
    const book12 = await bookRepo.save({
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

    // 這本書同時屬於程式設計和藝術設計分類
    await belongsToRepo.save([
      {
        bookID: book12.bookID,
        categoryId: categories[0].categoryID,
      },
      {
        bookID: book12.bookID,
        categoryId: categories[4].categoryID,
      },
    ]);

    // 第十三本 - 第一本書的舊版（已下架）
    const book13 = await bookRepo.save({
      ISBN: '9786263294000',
      name: '電腦&程式設計知識圖鑑 (舊版)',
      productDescription: 'AI時代不可不知的知識\n' +
        'AI是什麼？究竟什麼是程式設計？' +
        '程式語言有何區別？' +
        '最輕鬆、易懂的電腦＆程式設計圖鑑！',
      price: 320,
      inventoryQuantity: 100,
      status: 0,  // 有庫存不過是下架狀態
      author: '石戶奈奈子/ 監修',
      publisher: '台灣東販股份有限公司',
      merchantId: merchant1.memberID,
    });

    await bookImageRepo.save([
      {
        imageUrl: copyImageToUploads('BookImage-Demo/1/1.jpg'),
        displayOrder: 0,
        isCover: true,
        book: book13,
      },
      {
        imageUrl: copyImageToUploads('BookImage-Demo/1/2.jpg'),
        displayOrder: 1,
        isCover: false,
        book: book13,
      },
      {
        imageUrl: copyImageToUploads('BookImage-Demo/1/3.jpg'),
        displayOrder: 2,
        isCover: false,
        book: book13,
      },
    ]);

    await belongsToRepo.save({
      bookID: book13.bookID,
      categoryId: categories[0].categoryID,
    });

    console.log('✅ 創建了 13 本書籍');

    // 4. 創建訂單
    console.log('\n🛒 創建訂單數據...');
    const orderRepo = AppDataSource.getRepository(Order);
    const containsRepo = AppDataSource.getRepository(Contains);

    // User1 的第一筆訂單 - 向 merchant1 購買
    const order1 = await orderRepo.save({
      shippingAddress: '台北市大安區羅斯福路四段1號',
      paymentMethod: 1,
      totalPrice: 360,
      totalAmount: 1,
      state: 1, // 處理中
      userId: user1.memberID,
      merchantId: merchant1.memberID,
    });

    await containsRepo.save({
      orderId: order1.orderId,
      bookId: book1.bookID,
      amount: 1,
    });

    // User1 的第二筆訂單 - 向 merchant2 購買多本書
    const order2 = await orderRepo.save({
      shippingAddress: '台北市中山區南京東路三段219號',
      paymentMethod: 1,
      totalPrice: 1629, // 1300 + 149 + 180
      totalAmount: 3,
      state: 2, // 已出貨
      userId: user1.memberID,
      merchantId: merchant2.memberID,
    });

    await containsRepo.save([
      {
        orderId: order2.orderId,
        bookId: book3.bookID,
        amount: 1,
      },
      {
        orderId: order2.orderId,
        bookId: book4.bookID,
        amount: 1,
      },
      {
        orderId: order2.orderId,
        bookId: book7.bookID,
        amount: 1,
      },
    ]);

    // User2 的訂單 - 向 merchant3 購買
    const order3 = await orderRepo.save({
      shippingAddress: '新北市板橋區文化路一段188號',
      paymentMethod: 1,
      totalPrice: 680,
      totalAmount: 2,
      state: 0, // 待處理
      userId: user2.memberID,
      merchantId: merchant3.memberID,
    });

    await containsRepo.save([
      {
        orderId: order3.orderId,
        bookId: book5.bookID,
        amount: 1,
      },
      {
        orderId: order3.orderId,
        bookId: book8.bookID,
        amount: 1,
      },
    ]);

    // User3 的訂單 - 向 merchant2 購買
    const order4 = await orderRepo.save({
      shippingAddress: '高雄市前金區中正四路211號',
      paymentMethod: 1,
      totalPrice: 758,
      totalAmount: 1,
      state: 3, // 已完成
      userId: user3.memberID,
      merchantId: merchant2.memberID,
    });

    await containsRepo.save({
      orderId: order4.orderId,
      bookId: book6.bookID,
      amount: 1,
    });

    // User2 的第二筆訂單 - 向 merchant1 購買
    const order5 = await orderRepo.save({
      shippingAddress: '台南市中西區民族路二段76號',
      paymentMethod: 1,
      totalPrice: 560,
      totalAmount: 2,
      state: 1, // 處理中
      userId: user2.memberID,
      merchantId: merchant1.memberID,
    });

    await containsRepo.save([
      {
        orderId: order5.orderId,
        bookId: book9.bookID,
        amount: 2,
      },
    ]);

    // User3 的第二筆訂單 - 向 merchant1 購買
    const order6 = await orderRepo.save({
      shippingAddress: '桃園市中壢區中北路200號',
      paymentMethod: 1,
      totalPrice: 880,
      totalAmount: 2,
      state: 0, // 待處理
      userId: user3.memberID,
      merchantId: merchant1.memberID,
    });

    await containsRepo.save([
      {
        orderId: order6.orderId,
        bookId: book1.bookID,
        amount: 1,
      },
      {
        orderId: order6.orderId,
        bookId: book12.bookID,
        amount: 1,
      },
    ]);

    console.log('✅ 創建了 6 筆訂單');

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
    console.log(`🛒 訂單總數：${await orderRepo.count()}`);
    console.log(`   - 待處理：${await orderRepo.count({ where: { state: 0 } })}`);
    console.log(`   - 處理中：${await orderRepo.count({ where: { state: 1 } })}`);
    console.log(`   - 已出貨：${await orderRepo.count({ where: { state: 2 } })}`);
    console.log(`   - 已完成：${await orderRepo.count({ where: { state: 3 } })}`);
    console.log(`📦 訂單項目數：${await containsRepo.count()}`);
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
