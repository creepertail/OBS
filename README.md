# OBS — Online Bookstore System

一個完整的線上書店電商平台，採用前後端分離架構，支援一般用戶、商家與管理員三種角色。

---

## 技術棧

### 後端
| 技術 | 用途 |
|------|------|
| NestJS + TypeScript | 後端框架 |
| TypeORM | ORM / 資料庫映射 |
| MySQL 8.0 | 關聯式資料庫 |
| Passport.js + JWT | 身份驗證 |
| bcrypt | 密碼加密 |
| Multer | 圖片上傳 |

### 前端
| 技術 | 用途 |
|------|------|
| Vue 3 + TypeScript | 前端框架 |
| Vite | 打包工具 |
| Pinia | 狀態管理 |
| Vue Router | 路由管理 |
| Element Plus | UI 元件庫 |
| Axios | HTTP 請求 |

---

## 專案結構

```
OBS/
├── back_end/
│   └── obs-backend/         # NestJS 後端應用
│       └── src/
│           ├── member/      # 會員模組（含 JWT 驗證）
│           ├── book/        # 書籍模組
│           ├── cart/        # 購物車模組
│           ├── order/       # 訂單模組
│           ├── category/    # 分類模組
│           ├── review/      # 書評模組
│           ├── favorite/    # 我的最愛模組
│           ├── subscription/# 訂閱商家模組
│           ├── coupon/      # 優惠券模組
│           ├── claims/      # 舉報申請模組
│           ├── restrict_user/
│           ├── restrict_merchant/
│           ├── report/      # 商家銷售報表
│           └── uploads/     # 上傳圖片存放目錄
└── front_end/
    └── obs-frontend/        # Vue 3 前端應用
        └── src/
            ├── views/       # 頁面元件
            ├── components/  # 可複用元件
            ├── router/      # 路由設定
            ├── stores/      # Pinia 狀態管理
            └── type/        # TypeScript 型別定義
```

---

## 快速開始

### 環境需求

- Node.js v18+
- MySQL 8.0+
- npm

### 1. 建立資料庫

```sql
CREATE DATABASE obs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 啟動後端

```bash
cd back_end/obs-backend
npm install
```

建立 `.env` 檔案：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=obs
PORT=3000
JWT_SECRET=your_jwt_secret
```

```bash
npm run start:dev
```

後端服務：`http://localhost:3000`

### 3. 啟動前端

```bash
cd front_end/obs-frontend
npm install
npm run dev
```

前端服務：`http://localhost:5173`

---

## 功能模組

| 模組 | 功能說明 |
|------|---------|
| 會員系統 | 用戶 / 商家 / 管理員三種角色，註冊、登入、個人資料管理 |
| 書籍管理 | 商家新增、編輯、上下架書籍，支援多圖上傳 |
| 購物車 | 加入購物車、調整數量、移除項目 |
| 訂單系統 | 結帳、訂單列表、訂單狀態管理 |
| 書評系統 | 用戶評分與評論 |
| 我的最愛 | 收藏書籍 |
| 訂閱商家 | 訂閱商家並接收通知 |
| 優惠券 | 管理員發放，用戶兌換折扣碼 |
| 申請 / 舉報 | 用戶舉報商品或申請 |
| 用戶 / 商家限制 | 管理員封禁或限制帳號 |
| 銷售報表 | 商家查看銷售統計 |

---

## API 端點

### 會員
| 方法 | 路由 | 說明 |
|------|------|------|
| POST | `/members` | 註冊 |
| POST | `/members/login` | 登入 |
| GET | `/members/me` | 取得當前用戶資訊（需 JWT）|
| PATCH | `/members/:id` | 更新會員資訊（需 JWT）|

### 書籍
| 方法 | 路由 | 說明 |
|------|------|------|
| GET | `/books` | 取得所有書籍 |
| GET | `/books/search?keyword=` | 搜尋書籍 |
| GET | `/books/:id` | 取得單一書籍 |
| POST | `/books` | 新增書籍（商家）|
| POST | `/books/upload-image` | 上傳書籍圖片 |
| PATCH | `/books/:id` | 更新書籍（商家）|
| PATCH | `/books/:id/status` | 上下架書籍（商家）|
| DELETE | `/books/:id` | 刪除書籍（商家）|

### 購物車
| 方法 | 路由 | 說明 |
|------|------|------|
| GET | `/cart` | 取得購物車（需 JWT）|
| POST | `/cart` | 加入購物車（需 JWT）|
| PATCH | `/cart/:id` | 更新數量（需 JWT）|
| DELETE | `/cart/:id` | 移除項目（需 JWT）|

### 訂單
| 方法 | 路由 | 說明 |
|------|------|------|
| POST | `/orders/checkout` | 從購物車結帳（需 JWT）|
| GET | `/orders/me` | 查詢個人訂單（需 JWT）|
| GET | `/orders/:id` | 查詢訂單詳情（需 JWT）|
| PATCH | `/orders/:id` | 更新訂單狀態（需 JWT）|

---

## 授權機制

後端使用自訂 `@JWTGuard()` 裝飾器進行角色控制：

```typescript
@JWTGuard()                     // 任何登入用戶
@JWTGuard(MemberType.User)      // 僅一般用戶
@JWTGuard(MemberType.Merchant)  // 僅商家
@JWTGuard(MemberType.Admin)     // 僅管理員
```

JWT Payload 結構：

```json
{
  "sub": "memberID",
  "email": "user@example.com",
  "type": "user | merchant | admin"
}
```

---

## 常用指令

### 後端
```bash
npm run start:dev       # 開發模式（熱重載）
npm run build           # 編譯 TypeScript
npm run start:prod      # 生產模式
npm run test            # 執行單元測試
npm run lint            # 程式碼檢查
```

### 前端
```bash
npm run dev             # 開發模式
npm run build           # 生產打包
npm run preview         # 預覽生產版本
npm run type-check      # TypeScript 型別檢查
npm run lint            # 程式碼檢查
```

---

## 文件

- `back_end/BACKEND_SETUP_GUIDE.md` — 後端詳細設置與開發指南
- `back_end/DEVELOPMENT_PROGRESS.md` — 開發進度追蹤
- `SRS.pdf` — 軟體需求規格書
