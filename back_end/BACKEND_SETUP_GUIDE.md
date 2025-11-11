# 線上書城後端建置指南 (NestJS + MySQL)

## 📋 目錄
1. [環境準備](#環境準備)
2. [專案初始化](#專案初始化)
3. [資料庫設計](#資料庫設計)
4. [模組架構](#模組架構)
5. [開發步驟](#開發步驟)
6. [API 設計](#api-設計)

---

## 🔧 環境準備

### 必要工具
- Node.js (v18+)
- MySQL (v8.0+)
- npm 或 yarn
- VS Code (推薦)

### VS Code 推薦擴充套件
- ESLint
- Prettier
- REST Client (測試 API)

---

## 🚀 專案初始化

### Step 1: 使用 Nest CLI 建立專案
```bash
# 安裝 Nest CLI
npm install -g @nestjs/cli

# 建立新專案
nest new OBS-backend

# 進入專案目錄
cd OBS-backend
```

### Step 2: 安裝必要套件
```bash
# TypeORM 和 MySQL
npm install @nestjs/typeorm typeorm mysql2

# 設定檔管理
npm install @nestjs/config

# JWT 認證
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install -D @types/passport-jwt

# 密碼加密
npm install bcrypt
npm install -D @types/bcrypt

# 驗證工具
npm install class-validator class-transformer
```

---

## 🗄️ 資料庫設計

### 核心資料表

#### 1. Users (會員表)
```sql
CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  username VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  role ENUM('customer', 'admin') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 2. Books (書籍表)
```sql
CREATE TABLE books (
  book_id INT PRIMARY KEY AUTO_INCREMENT,
  isbn VARCHAR(13) UNIQUE,
  title VARCHAR(200) NOT NULL,
  author VARCHAR(100),
  publisher VARCHAR(100),
  publication_date DATE,
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INT DEFAULT 0,
  category VARCHAR(50),
  description TEXT,
  cover_image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 3. Orders (訂單表)
```sql
CREATE TABLE orders (
  order_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled') DEFAULT 'pending',
  shipping_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

#### 4. Order_Items (訂單明細表)
```sql
CREATE TABLE order_items (
  order_item_id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  book_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (book_id) REFERENCES books(book_id)
);
```

#### 5. Shopping_Cart (購物車表)
```sql
CREATE TABLE shopping_cart (
  cart_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  quantity INT DEFAULT 1,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (book_id) REFERENCES books(book_id),
  UNIQUE KEY unique_user_book (user_id, book_id)
);
```

---

## 📁 模組架構

```
src/
├── app.module.ts                 # 根模組
├── main.ts                       # 應用程式入口
├── config/
│   └── database.config.ts        # 資料庫設定
├── auth/                         # 認證模組
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   └── guards/
│       └── jwt-auth.guard.ts
├── users/                        # 會員模組
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── entities/
│   │   └── user.entity.ts
│   └── dto/
│       ├── create-user.dto.ts
│       └── update-user.dto.ts
├── books/                        # 書籍模組
│   ├── books.module.ts
│   ├── books.controller.ts
│   ├── books.service.ts
│   ├── entities/
│   │   └── book.entity.ts
│   └── dto/
│       ├── create-book.dto.ts
│       ├── update-book.dto.ts
│       └── search-book.dto.ts
├── orders/                       # 訂單模組
│   ├── orders.module.ts
│   ├── orders.controller.ts
│   ├── orders.service.ts
│   ├── entities/
│   │   ├── order.entity.ts
│   │   └── order-item.entity.ts
│   └── dto/
│       └── create-order.dto.ts
└── cart/                         # 購物車模組
    ├── cart.module.ts
    ├── cart.controller.ts
    ├── cart.service.ts
    ├── entities/
    │   └── cart.entity.ts
    └── dto/
        └── add-to-cart.dto.ts
```

---

## 🔨 開發步驟

### Phase 1: 基礎設定

#### 1. 設定環境變數
建立 `.env` 檔案：
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=obs

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

# App
PORT=3000
```

#### 2. 設定 TypeORM
在 `app.module.ts` 中配置：
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

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
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // 開發時使用，正式環境要改為 false
    }),
  ],
})
export class AppModule {}
```

**重要提醒**：
- 確保 `.env` 檔案放在專案根目錄（`obs-backend/.env`），不是外層資料夾
- 每個環境變數都加上預設值（`|| 'default_value'`），避免 TypeScript 型別錯誤

#### 3. 建立 MySQL 資料庫

在開始之前，需要先在 MySQL 中建立資料庫：

**方法 1：使用 MySQL 指令**
```bash
# 登入 MySQL
mysql -u root -p

# 建立資料庫
CREATE DATABASE OBS CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 確認建立成功
SHOW DATABASES;

# 離開
EXIT;
```

**方法 2：使用 MySQL Workbench**
1. 開啟 MySQL Workbench
2. 連接到你的 MySQL 伺服器
3. 點擊工具列的「Create a new schema」圖示
4. 輸入資料庫名稱：`OBS`
5. Character Set: `utf8mb4`
6. Collation: `utf8mb4_unicode_ci`
7. 點擊 Apply

**方法 3：使用 phpMyAdmin**
1. 開啟 phpMyAdmin
2. 點擊左側的「新增」或頂部的「資料庫」
3. 輸入資料庫名稱：`OBS`
4. 選擇編碼：`utf8mb4_unicode_ci`
5. 點擊「建立」

#### 4. 測試專案是否正常運行

完成上述設定後，測試專案能否成功啟動：

```bash
# 確保在專案目錄中
cd obs-backend

# 啟動開發伺服器
npm run start:dev
```

**預期看到的成功訊息**：
```
[Nest] Starting Nest application...
[Nest] AppModule dependencies initialized
[Nest] TypeOrmModule dependencies initialized
[Nest] ConfigModule dependencies initialized
[Nest] TypeOrmCoreModule dependencies initialized
[Nest] Nest application successfully started  ← 看到這個就成功了！
```

**如果看到錯誤訊息**：

| 錯誤訊息 | 原因 | 解決方法 |
|---------|------|---------|
| `Unknown database 'obs'` | 資料庫還沒建立 | 按照步驟 3 建立 OBS 資料庫 |
| `Access denied for user` | 帳號密碼錯誤 | 檢查 `.env` 的 `DB_USERNAME` 和 `DB_PASSWORD` |
| `Type 'undefined' is not assignable to type 'string'` | 環境變數讀取失敗 | 確認 `.env` 在正確位置，並在環境變數後加上預設值（如 `\|\| '3306'`） |
| `ECONNREFUSED` | MySQL 沒有啟動 | 啟動 MySQL 服務（XAMPP/MAMP 或 `mysql.server start`） |
| `EADDRINUSE: address already in use` | Port 3000 被其他程序佔用 | 參考步驟 6「如何停止開發伺服器」關閉佔用的程序 |

#### 5. 測試 API 是否回應

開啟另一個終端機視窗，測試伺服器是否正常回應：

**方法 1：使用 curl（推薦）**
```bash
curl http://localhost:3000
```

**方法 2：使用瀏覽器**
- 直接開啟 `http://localhost:3000`

**預期結果**：
```json
{
  "message": "Cannot GET /",
  "error": "Not Found",
  "statusCode": 404
}
```

看到 404 錯誤是**正常的**！這表示：
- ✅ 伺服器正常運行
- ✅ API 可以正常回應
- ⚠️ 根路由沒有定義（因為還沒建立任何 Controller）

#### 6. 如何停止開發伺服器

當你需要停止正在運行的開發伺服器時：

**方法 1：正常停止（最推薦）**
在運行 `npm run start:dev` 的終端機視窗中按：
```
Ctrl + C
```
連按兩次確保完全停止。

**方法 2：強制停止（當程序卡住時）**

如果 `Ctrl + C` 無效，或出現 `EADDRINUSE: address already in use` 錯誤：

**Step 1：找出佔用 port 的程序**
```bash
# 查看哪個程序佔用 port 3000
netstat -ano | findstr :3000

# 輸出範例：
# TCP    0.0.0.0:3000    0.0.0.0:0    LISTENING    22048
#                                                   ↑ 這是 PID（程序 ID）
```

**Step 2：強制結束該程序**
```bash
# 使用 PowerShell 強制停止（將 22048 替換成你的 PID）
powershell -Command "Stop-Process -Id 22048 -Force"
```

**或使用 taskkill**
```bash
taskkill /PID 22048 /F
```

**Step 3：確認 port 已經釋放**
```bash
# 再次檢查，應該不會有任何輸出
netstat -ano | findstr :3000
```

**常見情境**：
- 💡 不小心開了多個開發伺服器
- 💡 程序異常終止但 port 沒有釋放
- 💡 修改程式碼後想要重新啟動

#### 7. Phase 1 完成檢查清單

確認以下項目都完成：

- [ ] NestJS 專案建立完成
- [ ] 必要套件安裝完成（TypeORM, MySQL2, Config, JWT 等）
- [ ] `.env` 檔案建立並放在正確位置（`obs-backend/.env`）
- [ ] `app.module.ts` 設定 TypeORM 連接
- [ ] MySQL 資料庫 `OBS` 建立完成
- [ ] 執行 `npm run start:dev` 成功啟動
- [ ] 看到 "Nest application successfully started" 訊息
- [ ] 訪問 `http://localhost:3000` 有回應（即使是 404）

**🎉 恭喜！Phase 1 完成，可以開始 Phase 2 了！**

---

### Phase 2: 建立 Entity

Entity 是 TypeORM 中用來定義資料表結構的類別。每個 Entity 對應資料庫中的一張表。

#### 步驟 1：建立 users 模組的資料夾結構

在開始之前，我們需要建立模組的資料夾結構：

```bash
# 進入專案目錄
cd obs-backend

# 建立 users 模組的資料夾結構
mkdir -p src/users/entities
```

**Windows 使用者注意**：如果 `mkdir -p` 指令無法使用，請使用以下指令：
```bash
mkdir src\users
mkdir src\users\entities
```

或者直接在 VS Code 中：
1. 在左側檔案總管中，右鍵點擊 `src` 資料夾
2. 選擇「新增資料夾」
3. 輸入 `users`
4. 在 `users` 資料夾上右鍵，選擇「新增資料夾」
5. 輸入 `entities`

完成後，你的資料夾結構應該如下：
```
src/
├── users/
│   └── entities/
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts
```

#### 步驟 2：建立 User Entity 檔案

現在我們要建立第一個 Entity 檔案：

**方法 1：使用 VS Code 建立（推薦）**
1. 在左側檔案總管中，右鍵點擊 `src/users/entities` 資料夾
2. 選擇「新增檔案」
3. 輸入檔案名稱：`user.entity.ts`

**方法 2：使用指令建立**
```bash
# 在專案目錄中執行
touch src/users/entities/user.entity.ts
```

**Windows 使用者**可以使用：
```bash
type nul > src\users\entities\user.entity.ts
```

#### 步驟 3：撰寫 User Entity 程式碼

打開剛剛建立的 `src/users/entities/user.entity.ts` 檔案，並輸入以下程式碼：

```typescript
// src/users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 50 })
  username: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ type: 'enum', enum: ['customer', 'admin'], default: 'customer' })
  role: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

#### 步驟 4：理解 Entity 的結構

讓我們了解一下這個 Entity 的各個部分：

**1. 匯入必要的裝飾器（Decorators）**
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
```
- `Entity`：標記這是一個實體類別，對應資料庫中的表
- `PrimaryGeneratedColumn`：自動遞增的主鍵
- `Column`：定義表中的欄位
- `CreateDateColumn`：自動記錄建立時間
- `UpdateDateColumn`：自動記錄更新時間

**2. Entity 裝飾器**
```typescript
@Entity('users')
```
- `'users'` 是資料庫中的表名稱
- 如果不指定，預設會使用類別名稱的小寫版本

**3. 欄位定義**
- `@PrimaryGeneratedColumn()`：主鍵，會自動遞增
- `@Column({ unique: true, length: 100 })`：唯一值欄位，最大長度 100
- `@Column({ length: 255 })`：普通欄位，最大長度 255
- `@Column({ nullable: true })`：可以為空的欄位
- `@Column({ type: 'enum', enum: [...], default: 'customer' })`：枚舉類型，有預設值

#### 步驟 5：在 app.module.ts 中註冊 Entity

為了讓 TypeORM 能夠識別這個 Entity，我們需要更新 `app.module.ts`：

打開 `src/app.module.ts`，確認檔案內容如下（TypeORM 的 `entities` 設定應該已經包含了自動掃描）：

```typescript
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
```

**重要**：`entities: [__dirname + '/**/*.entity{.ts,.js}']` 這行設定會自動掃描所有以 `.entity.ts` 結尾的檔案，所以不需要手動逐一註冊每個 Entity。

#### 步驟 6：測試 Entity 是否正確連接

完成以上步驟後，重新啟動開發伺服器來測試：

```bash
# 如果伺服器正在運行，先按 Ctrl + C 停止
# 然後重新啟動
npm run start:dev
```

**成功的訊息**應該包含：
```
[Nest] Starting Nest application...
[Nest] TypeOrmModule dependencies initialized
[Nest] Mapped {/, GET} route
[Nest] Nest application successfully started
```

**檢查資料庫**：
1. 打開 MySQL Workbench 或 phpMyAdmin
2. 選擇 `OBS` 資料庫
3. 查看表格列表，應該會看到新建立的 `users` 表

**如果看到 `users` 表，恭喜你成功建立了第一個 Entity！**

#### 步驟 7：檢查自動建立的資料表結構

連接到 MySQL，執行以下指令檢查表結構：

```sql
USE OBS;
DESCRIBE users;
```

你應該會看到類似這樣的輸出：
```
+------------+---------------------------------+------+-----+---------+----------------+
| Field      | Type                            | Null | Key | Default | Extra          |
+------------+---------------------------------+------+-----+---------+----------------+
| user_id    | int                             | NO   | PRI | NULL    | auto_increment |
| email      | varchar(100)                    | NO   | UNI | NULL    |                |
| password   | varchar(255)                    | NO   |     | NULL    |                |
| username   | varchar(50)                     | NO   |     | NULL    |                |
| phone      | varchar(20)                     | YES  |     | NULL    |                |
| role       | enum('customer','admin')        | NO   |     | customer|                |
| created_at | datetime(6)                     | NO   |     | CURRENT_TIMESTAMP(6) |  |
| updated_at | datetime(6)                     | NO   |     | CURRENT_TIMESTAMP(6) |  |
+------------+---------------------------------+------+-----+---------+----------------+
```

#### 常見錯誤排除

| 錯誤訊息 | 原因 | 解決方法 |
|---------|------|---------|
| `Cannot find module 'typeorm'` | TypeORM 未安裝 | 執行 `npm install @nestjs/typeorm typeorm mysql2` |
| `Table 'users' already exists` | 表已經存在但結構不同 | 刪除舊表或將 `synchronize` 改為 `false` 並使用 migration |
| `Entity metadata for User was not found` | Entity 未被正確掃描 | 檢查 `app.module.ts` 中的 `entities` 設定 |
| 啟動後沒有建立表 | `synchronize: false` | 確認 `app.module.ts` 中 `synchronize: true` |

#### Phase 2 完成檢查清單

確認以下項目都完成：

- [ ] 建立了 `src/users/entities` 資料夾
- [ ] 建立了 `user.entity.ts` 檔案
- [ ] 程式碼沒有語法錯誤（VS Code 不會顯示紅色波浪線）
- [ ] 重新啟動開發伺服器成功
- [ ] 資料庫中自動建立了 `users` 表
- [ ] 表結構與 Entity 定義一致

**🎉 恭喜！Phase 2 完成，你已經成功建立了第一個 Entity！**

---

### Phase 2.5: 使用 TypeORM Migration 管理資料庫（推薦）

#### 為什麼需要 Migration？

在開發過程中，使用 `synchronize: true` 會遇到以下問題：
- ❌ 每次重啟應用程式都會嘗試重新建立表，造成「Table already exists」錯誤
- ❌ 無法追蹤資料庫結構的變更歷史
- ❌ 團隊協作時資料庫結構容易不一致
- ❌ 正式環境使用非常危險（可能會刪除資料）

**Migration 的好處**：
- ✅ 不會重複建表，可以安全重啟應用程式
- ✅ 可以版本控制資料庫變更
- ✅ 可以回滾（rollback）資料庫變更
- ✅ 團隊成員可以同步資料庫結構

#### 步驟 1：安裝必要套件

```bash
npm install -D ts-node @types/node
```

#### 步驟 2：建立 TypeORM Data Source 設定檔

建立 `src/data-source.ts`：

```typescript
// src/data-source.ts
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// 載入環境變數
config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'OBS',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: true,
});
```

#### 步驟 3：在 package.json 新增 Migration 指令

打開 `package.json`，在 `scripts` 區塊中新增以下指令：

```json
{
  "scripts": {
    "typeorm": "typeorm-ts-node-commonjs -d src/data-source.ts",
    "migration:generate": "npm run typeorm -- migration:generate",
    "migration:run": "npm run typeorm -- migration:run",
    "migration:revert": "npm run typeorm -- migration:revert"
  }
}
```

#### 步驟 4：建立 migrations 資料夾

```bash
mkdir src/migrations
```

或在 VS Code 中手動建立 `src/migrations` 資料夾。

#### 步驟 5：將 app.module.ts 中的 synchronize 改為 false

打開 `src/app.module.ts`，將 `synchronize: true` 改為 `synchronize: false`：

```typescript
TypeOrmModule.forRoot({
  // ... 其他設定
  synchronize: false, // 改為 false，使用 Migration 管理
}),
```

#### 步驟 6：生成 Migration 檔案

當你建立或修改 Entity 後，執行以下指令生成 Migration：

```bash
npm run migration:generate -- src/migrations/CreateBookTables
```

TypeORM 會：
1. 比對你的 Entity 和資料庫現有結構
2. 自動生成 SQL 指令
3. 建立一個新的 Migration 檔案（例如：`1762584580047-CreateBookTables.ts`）

**生成的 Migration 檔案範例**：
```typescript
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBookTables1762584580047 implements MigrationInterface {
    name = 'CreateBookTables1762584580047'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 建立 book 表
        await queryRunner.query(`CREATE TABLE \`book\` ...`);

        // 建立 book_images 表
        await queryRunner.query(`CREATE TABLE \`book_images\` ...`);

        // 建立外鍵約束
        await queryRunner.query(`ALTER TABLE \`book_images\` ADD CONSTRAINT ...`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 回滾時執行（刪除表）
        await queryRunner.query(`DROP TABLE \`book_images\``);
        await queryRunner.query(`DROP TABLE \`book\``);
    }
}
```

#### 步驟 7：執行 Migration

```bash
npm run migration:run
```

**執行結果**：
```
Migration CreateBookTables1762584580047 has been executed successfully.
```

TypeORM 會：
1. 在資料庫中建立 `migrations` 表（追蹤已執行的 migration）
2. 執行 `up()` 方法中的 SQL 指令
3. 記錄此 migration 已執行

#### 步驟 8：驗證資料表已建立

連接到 MySQL，檢查資料表：

```sql
USE OBS;
SHOW TABLES;
```

你應該會看到：
```
+---------------+
| Tables_in_OBS |
+---------------+
| book          |
| book_images   |
| migrations    |
| users         |
+---------------+
```

檢查 migrations 表的內容：
```sql
SELECT * FROM migrations;
```

結果：
```
| id | timestamp      | name                           |
|----|----------------|--------------------------------|
| 1  | 1762584580047  | CreateBookTables1762584580047 |
```

#### Migration 常用指令

```bash
# 生成新的 migration（會自動比對 Entity 和資料庫的差異）
npm run migration:generate -- src/migrations/NameOfMigration

# 執行所有尚未執行的 migration
npm run migration:run

# 回滾最後一次 migration
npm run migration:revert

# 顯示所有 migration 的狀態
npm run typeorm -- migration:show
```

#### Migration vs Synchronize 對比

| 特性 | `synchronize: true` | Migration |
|------|---------------------|-----------|
| 重複啟動 | ❌ 會報錯 | ✅ 不會重複執行 |
| 版本控制 | ❌ 無法追蹤 | ✅ 可以看歷史變更 |
| 團隊協作 | ❌ 容易衝突 | ✅ 統一資料庫結構 |
| 生產環境 | ❌ 危險（可能刪資料） | ✅ 安全可控 |
| 回滾 | ❌ 無法回滾 | ✅ 可以執行 `down()` |
| 開發速度 | ✅ 快速（自動同步） | ⚠️ 需要手動生成 |

#### 實際開發流程

**情境：新增一個 Category Entity**

1. 建立 Entity 檔案 `src/categories/entities/category.entity.ts`
2. 生成 Migration：
   ```bash
   npm run migration:generate -- src/migrations/CreateCategoryTable
   ```
3. 檢查生成的 Migration 檔案，確認 SQL 正確
4. 執行 Migration：
   ```bash
   npm run migration:run
   ```
5. 提交到 Git：
   ```bash
   git add src/categories src/migrations
   git commit -m "Add Category entity and migration"
   ```

**團隊成員同步**：
```bash
git pull
npm run migration:run  # 自動執行新的 migration
```

#### 常見問題排除

**Q: Migration 生成失敗，顯示 "No changes in database schema were found"**

A: 表示你的 Entity 定義和資料庫結構完全一致，不需要生成 migration。

**Q: 如果我不小心執行錯誤的 Migration 怎麼辦？**

A: 使用 `npm run migration:revert` 回滾最後一次 migration。

**Q: 能否跳過某個 Migration？**

A: 可以手動修改 `migrations` 表，但不建議這樣做。應該使用 `migration:revert` 回滾。

**Q: 正式環境如何使用 Migration？**

A:
1. 確保 `synchronize: false`
2. 在部署前先執行 `npm run migration:run`
3. 確保 Migration 檔案和程式碼一起部署

#### Phase 2.5 完成檢查清單

- [ ] 安裝 ts-node 和 @types/node
- [ ] 建立 `src/data-source.ts` 設定檔
- [ ] 在 `package.json` 新增 migration 指令
- [ ] 建立 `src/migrations` 資料夾
- [ ] 將 `app.module.ts` 的 `synchronize` 改為 `false`
- [ ] 成功生成第一個 Migration
- [ ] 成功執行 Migration
- [ ] 資料庫中出現 `migrations` 追蹤表

**🎉 恭喜！Migration 設定完成，之後新增或修改 Entity 都不會有重複建表的問題了！**

---

### Phase 3: 建立模組

使用 Nest CLI 快速生成：
```bash
# 生成 users 模組
nest g module users
nest g controller users
nest g service users

# 生成 books 模組
nest g module books
nest g controller books
nest g service books

# 生成 orders 模組
nest g module orders
nest g controller orders
nest g service orders

# 生成 cart 模組
nest g module cart
nest g controller cart
nest g service cart

# 生成 auth 模組
nest g module auth
nest g controller auth
nest g service auth
```

### Phase 4: 實作 DTO (資料傳輸物件)

#### 範例：Create User DTO
```typescript
// src/users/dto/create-user.dto.ts
import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
```

### Phase 5: 實作 Service

#### 範例：Books Service 基礎 CRUD
```typescript
// src/books/books.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    const book = this.booksRepository.create(createBookDto);
    return await this.booksRepository.save(book);
  }

  async findAll(): Promise<Book[]> {
    return await this.booksRepository.find();
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.booksRepository.findOne({ where: { book_id: id } });
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto): Promise<Book> {
    await this.findOne(id); // 確認書籍存在
    await this.booksRepository.update(id, updateBookDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.booksRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
  }
}
```

### Phase 6: 實作 Controller

#### 範例：Books Controller
```typescript
// src/books/books.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @UseGuards(JwtAuthGuard) // 需要登入才能新增書籍
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Get()
  findAll() {
    return this.booksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.update(+id, updateBookDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.booksService.remove(+id);
  }
}
```

### Phase 7: 實作 JWT 認證

#### 1. JWT Strategy
```typescript
// src/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
```

#### 2. Auth Service
```typescript
// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string, username: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.usersService.create({
      email,
      password: hashedPassword,
      username,
    });
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.user_id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.user_id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }
}
```

---

## 🔌 API 設計

### 認證相關
- `POST /auth/register` - 註冊
- `POST /auth/login` - 登入

### 會員相關
- `GET /users/profile` - 取得個人資料（需登入）
- `PATCH /users/profile` - 更新個人資料（需登入）

### 書籍相關
- `GET /books` - 取得所有書籍
- `GET /books/:id` - 取得單一書籍
- `GET /books/search?keyword=xxx` - 搜尋書籍
- `POST /books` - 新增書籍（需管理員權限）
- `PATCH /books/:id` - 更新書籍（需管理員權限）
- `DELETE /books/:id` - 刪除書籍（需管理員權限）

### 購物車相關
- `GET /cart` - 取得購物車內容（需登入）
- `POST /cart` - 加入購物車（需登入）
- `PATCH /cart/:id` - 更新購物車數量（需登入）
- `DELETE /cart/:id` - 移除購物車項目（需登入）

### 訂單相關
- `POST /orders` - 建立訂單（需登入）
- `GET /orders` - 取得訂單列表（需登入）
- `GET /orders/:id` - 取得訂單詳情（需登入）
- `PATCH /orders/:id/status` - 更新訂單狀態（需管理員權限）

---

## 🧪 測試 API

建立 `test.http` 檔案（使用 REST Client 擴充套件）：

```http
### 註冊
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "username": "測試用戶"
}

### 登入
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

### 取得所有書籍
GET http://localhost:3000/books

### 新增書籍（需要 JWT token）
POST http://localhost:3000/books
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE

{
  "isbn": "9789571234567",
  "title": "測試書籍",
  "author": "測試作者",
  "publisher": "測試出版社",
  "price": 350,
  "stock_quantity": 100,
  "category": "程式設計"
}
```

---

## 🚀 啟動專案

```bash
# 開發模式
npm run start:dev

# 正式環境
npm run build
npm run start:prod
```

---

## 📝 開發檢查清單

- [ ] MySQL 資料庫建立完成
- [ ] `.env` 設定檔配置完成
- [ ] 所有 Entity 建立完成
- [ ] 基礎 CRUD API 實作完成
- [ ] JWT 認證機制實作完成
- [ ] API 測試通過
- [ ] 與前端 Vue.js 整合測試
- [ ] 錯誤處理機制
- [ ] API 文檔撰寫（可使用 Swagger）
- [ ] 資料驗證完善

---

## 🔗 與前端整合注意事項

### CORS 設定
在 `main.ts` 中啟用 CORS：
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 啟用 CORS
  app.enableCors({
    origin: 'http://localhost:5173', // Vue.js 開發伺服器位址
    credentials: true,
  });

  // 啟用全域驗證
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();
```

### API 回應格式統一
建議所有 API 回應使用統一格式：
```typescript
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

---

## 📚 參考資源

- [NestJS 官方文件](https://docs.nestjs.com/)
- [TypeORM 文件](https://typeorm.io/)
- [JWT 認證最佳實踐](https://jwt.io/introduction)

---

## 💡 進階功能建議

1. **Swagger API 文檔**
   ```bash
   npm install @nestjs/swagger swagger-ui-express
   ```

2. **檔案上傳（書籍封面）**
   ```bash
   npm install @nestjs/platform-express multer
   ```

3. **分頁功能**
   - 使用 TypeORM 的 `skip` 和 `take`

4. **快取機制**
   ```bash
   npm install cache-manager
   npm install @nestjs/cache-manager
   ```

5. **日誌記錄**
   - 使用 NestJS 內建的 Logger

6. **資料庫遷移**
   - 使用 TypeORM Migration 管理資料庫版本

---

## 🧪 測試 API 實戰教學

### 使用 VS Code REST Client 擴充套件測試（推薦）

#### 步驟 1：安裝 REST Client 擴充套件

1. 打開 VS Code
2. 點擊左側的擴充套件圖示（或按 `Ctrl+Shift+X`）
3. 搜尋「REST Client」
4. 安裝由 Huachao Mao 開發的 REST Client

#### 步驟 2：建立測試檔案

在專案根目錄建立 `test-api.http` 檔案：

```http
### ========================================
### Books API 測試
### ========================================

### 變數設定
@baseUrl = http://localhost:3000
@bookId =

### 1. 測試伺服器是否運行
GET {{baseUrl}}

### 2. 取得所有書籍（應該是空陣列）
GET {{baseUrl}}/books

### 3. 新增第一本書籍
POST {{baseUrl}}/books
Content-Type: application/json

{
  "ISBN": "9789571234567",
  "Name": "Node.js 實戰開發",
  "ProductDescription": "深入淺出學習 Node.js 後端開發，從零開始打造企業級應用",
  "Price": 450,
  "InventoryQuantity": 100,
  "Status": 1,
  "Author": "張三",
  "Publisher": "人民郵電出版社",
  "MerchantID": "merchant-uuid-123",
  "images": [
    {
      "imageUrl": "https://via.placeholder.com/300x400?text=Cover",
      "displayOrder": 0,
      "isCover": true
    },
    {
      "imageUrl": "https://via.placeholder.com/300x400?text=Back",
      "displayOrder": 1,
      "isCover": false
    }
  ]
}

### 4. 新增第二本書籍
POST {{baseUrl}}/books
Content-Type: application/json

{
  "ISBN": "9787115556789",
  "Name": "TypeScript 完全指南",
  "ProductDescription": "TypeScript 從入門到精通，掌握現代前端開發技術",
  "Price": 520,
  "InventoryQuantity": 50,
  "Status": 1,
  "Author": "李四",
  "Publisher": "電子工業出版社",
  "MerchantID": "merchant-uuid-123",
  "images": [
    {
      "imageUrl": "https://via.placeholder.com/300x400?text=TS+Cover",
      "displayOrder": 0,
      "isCover": true
    }
  ]
}

### 5. 再次取得所有書籍（應該有 2 本書）
GET {{baseUrl}}/books

### 6. 根據 ID 取得單一書籍（記得替換成實際的 bookID）
# 從上面的回應中複製 bookID，貼到最上面的 @bookId 變數中
GET {{baseUrl}}/books/{{bookId}}

### 7. 根據 ISBN 取得書籍
GET {{baseUrl}}/books/isbn/9789571234567

### 8. 更新書籍資訊（記得替換成實際的 bookID）
PATCH {{baseUrl}}/books/{{bookId}}
Content-Type: application/json

{
  "Price": 399,
  "InventoryQuantity": 80
}

### 9. 更新書籍狀態（下架）
PATCH {{baseUrl}}/books/{{bookId}}/status
Content-Type: application/json

{
  "status": 0
}

### 10. 新增書籍圖片
POST {{baseUrl}}/books/{{bookId}}/images
Content-Type: application/json

{
  "imageUrl": "https://via.placeholder.com/300x400?text=New+Image",
  "displayOrder": 2,
  "isCover": false
}

### 11. 刪除書籍圖片（記得替換成實際的 imageId）
DELETE {{baseUrl}}/books/images/{imageId}

### 12. 刪除書籍（記得替換成實際的 bookID）
DELETE {{baseUrl}}/books/{{bookId}}

### ========================================
### Users API 測試
### ========================================

### 1. 新增使用者
POST {{baseUrl}}/users
Content-Type: application/json

{
  "email": "test@example.com",
  "account": "testuser",
  "password": "password123",
  "username": "測試用戶",
  "phone": "0912345678"
}

### 2. 取得所有使用者
GET {{baseUrl}}/users

### 3. 根據 ID 取得使用者（記得替換成實際的 user_id）
GET {{baseUrl}}/users/{userId}
```

#### 步驟 3：使用 REST Client 測試

1. 打開 `test-api.http` 檔案
2. 確保後端伺服器正在運行（`npm run start:dev`）
3. 點擊每個請求上方的 **Send Request** 連結
4. 查看右側面板的回應結果

**示範：測試「新增書籍」API**

1. 找到「3. 新增第一本書籍」區塊
2. 點擊 `POST {{baseUrl}}/books` 上方的 **Send Request**
3. 右側會顯示回應結果：

```json
{
  "bookID": "e8c7b2a1-3d4f-5e6g-7h8i-9j0k1l2m3n4o",
  "ISBN": "9789571234567",
  "Name": "Node.js 實戰開發",
  "ProductDescription": "深入淺出學習 Node.js 後端開發，從零開始打造企業級應用",
  "Price": 450,
  "InventoryQuantity": 100,
  "Status": 1,
  "Author": "張三",
  "Publisher": "人民郵電出版社",
  "MerchantID": "merchant-uuid-123",
  "images": [
    {
      "imageID": "img-uuid-1",
      "imageUrl": "https://via.placeholder.com/300x400?text=Cover",
      "displayOrder": 0,
      "isCover": true
    },
    {
      "imageID": "img-uuid-2",
      "imageUrl": "https://via.placeholder.com/300x400?text=Back",
      "displayOrder": 1,
      "isCover": false
    }
  ],
  "created_at": "2025-11-08T06:52:23.000Z",
  "updated_at": "2025-11-08T06:52:23.000Z"
}
```

4. 複製回應中的 `bookID` 值
5. 將它貼到檔案最上方的 `@bookId =` 後面：
   ```http
   @bookId = e8c7b2a1-3d4f-5e6g-7h8i-9j0k1l2m3n4o
   ```
6. 現在你可以測試其他需要 bookID 的 API 了！

---

### 使用 Postman 測試（替代方案）

#### 步驟 1：安裝 Postman

1. 前往 [Postman 官網](https://www.postman.com/downloads/)
2. 下載並安裝 Postman

#### 步驟 2：建立新請求

**測試「新增書籍」API**：

1. 打開 Postman
2. 點擊左上角的「New」→「HTTP Request」
3. 設定請求方法為 **POST**
4. 輸入 URL：`http://localhost:3000/books`
5. 切換到「Body」頁籤
6. 選擇「raw」和「JSON」
7. 輸入以下 JSON 資料：

```json
{
  "ISBN": "9789571234567",
  "Name": "Node.js 實戰開發",
  "ProductDescription": "深入淺出學習 Node.js 後端開發，從零開始打造企業級應用",
  "Price": 450,
  "InventoryQuantity": 100,
  "Status": 1,
  "Author": "張三",
  "Publisher": "人民郵電出版社",
  "MerchantID": "merchant-uuid-123",
  "images": [
    {
      "imageUrl": "https://via.placeholder.com/300x400?text=Cover",
      "displayOrder": 0,
      "isCover": true
    },
    {
      "imageUrl": "https://via.placeholder.com/300x400?text=Back",
      "displayOrder": 1,
      "isCover": false
    }
  ]
}
```

8. 點擊「Send」按鈕
9. 查看下方的回應結果

**測試「取得所有書籍」API**：

1. 新建請求，方法改為 **GET**
2. URL：`http://localhost:3000/books`
3. 點擊「Send」
4. 查看回應，應該會看到剛才新增的書籍

---

### 使用 curl 測試（命令列）

**取得所有書籍**：
```bash
curl http://localhost:3000/books
```

**新增書籍**：
```bash
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{
    "ISBN": "9789571234567",
    "Name": "Node.js 實戰開發",
    "ProductDescription": "深入淺出學習 Node.js 後端開發",
    "Price": 450,
    "InventoryQuantity": 100,
    "Status": 1,
    "Author": "張三",
    "Publisher": "人民郵電出版社",
    "MerchantID": "merchant-uuid-123",
    "images": [
      {
        "imageUrl": "https://via.placeholder.com/300x400?text=Cover",
        "displayOrder": 0,
        "isCover": true
      }
    ]
  }'
```

**根據 ID 取得書籍**（替換成實際的 bookID）：
```bash
curl http://localhost:3000/books/e8c7b2a1-3d4f-5e6g-7h8i-9j0k1l2m3n4o
```

---

### 常見錯誤和解決方法

#### 1. 連接被拒絕（Connection Refused）

**錯誤訊息**：
```
Error: connect ECONNREFUSED 127.0.0.1:3000
```

**原因**：後端伺服器沒有啟動

**解決方法**：
```bash
cd obs-backend
npm run start:dev
```

#### 2. 400 Bad Request - 驗證錯誤

**回應範例**：
```json
{
  "statusCode": 400,
  "message": [
    "Price must be greater than 0",
    "ISBN must be exactly 13 characters"
  ],
  "error": "Bad Request"
}
```

**原因**：資料不符合 DTO 的驗證規則

**解決方法**：檢查並修正請求資料

#### 3. 404 Not Found

**回應範例**：
```json
{
  "statusCode": 404,
  "message": "Book with ID xxx not found",
  "error": "Not Found"
}
```

**原因**：指定的 ID 不存在

**解決方法**：使用正確的 ID 或先新增資料

#### 4. 409 Conflict - ISBN 已存在

**回應範例**：
```json
{
  "statusCode": 409,
  "message": "ISBN already exists",
  "error": "Conflict"
}
```

**原因**：嘗試新增重複的 ISBN

**解決方法**：使用不同的 ISBN 或更新現有書籍

---

### 測試流程建議

**完整測試流程**：

1. ✅ 確認伺服器運行：`GET /`
2. ✅ 新增第一本書：`POST /books`
3. ✅ 查看所有書籍：`GET /books`
4. ✅ 查看單一書籍：`GET /books/:id`
5. ✅ 根據 ISBN 查詢：`GET /books/isbn/:isbn`
6. ✅ 更新書籍資訊：`PATCH /books/:id`
7. ✅ 更新書籍狀態：`PATCH /books/:id/status`
8. ✅ 新增書籍圖片：`POST /books/:id/images`
9. ✅ 刪除書籍：`DELETE /books/:id`

**檢查清單**：

- [ ] 所有 GET 請求都能正常回應
- [ ] POST 請求能成功新增資料
- [ ] PATCH 請求能成功更新資料
- [ ] DELETE 請求能成功刪除資料
- [ ] 驗證規則正常運作（例如 Price > 0）
- [ ] 錯誤訊息清楚明確
- [ ] 資料庫中的資料與 API 回應一致

---

祝你開發順利！🎉
