# JWTGuard 裝飾器使用說明

## 簡介

`@JWTGuard()` 是一個組合型的裝飾器，可以同時處理 JWT 驗證和角色權限控制。

## ⚠️ 重要：Admin 超級權限規則

**Admin 擁有最高權限，可以訪問所有需要角色驗證的端點：**

- `@JWTGuard(MemberType.User)` → **User 或 Admin** 都可以訪問
- `@JWTGuard(MemberType.Merchant)` → **Merchant 或 Admin** 都可以訪問
- `@JWTGuard(MemberType.User, MemberType.Merchant)` → **User、Merchant 或 Admin** 都可以訪問
- `@JWTGuard()` → **任何已驗證的會員**都可以訪問

**這意味著：**
- 當你設定 `@JWTGuard(MemberType.User)` 時，不需要額外加上 `MemberType.Admin`，Admin 會自動擁有訪問權限
- Admin 角色在系統中具有超級管理員身份，可以執行所有操作

---

## 使用方式

### 1. 匯入裝飾器和 MemberType

```typescript
import { JWTGuard } from './decorators';
import { MemberType } from './member-type.enum';
```

### 2. 使用範例

#### 範例 1：只允許 User 角色訪問（Admin 也可以）

```typescript
@JWTGuard(MemberType.User)
@Get('user-only')
userOnlyEndpoint(@CurrentUser() user: any) {
  return { message: '只有 User 可以訪問' };
}
```

**誰可以訪問：** User 或 Admin

---

#### 範例 2：只允許 Merchant 角色訪問（Admin 也可以）

```typescript
@JWTGuard(MemberType.Merchant)
@Post('books')
createBook(@CurrentUser() user: any) {
  return { message: '建立書籍' };
}
```

**誰可以訪問：** Merchant 或 Admin

---

#### 範例 3：允許 User 或 Merchant 角色訪問（Admin 也可以）

```typescript
@JWTGuard(MemberType.User, MemberType.Merchant)
@Get('user-or-merchant')
userOrMerchantEndpoint(@CurrentUser() user: any) {
  return { message: 'User 或 Merchant 都可以訪問' };
}
```

**誰可以訪問：** User、Merchant 或 Admin

---

#### 範例 4：只驗證 JWT，不限制角色

```typescript
@JWTGuard()
@Get('authenticated-only')
authenticatedOnlyEndpoint(@CurrentUser() user: any) {
  return { message: '任何已登入的使用者都可以訪問' };
}
```

**誰可以訪問：** 任何已驗證的會員（User、Merchant、Admin）

---

#### 範例 5：只允許 Admin 角色訪問

```typescript
@JWTGuard(MemberType.Admin)
@Delete('admin-only/:id')
adminOnlyEndpoint(@Param('id') id: string) {
  return { message: '只有 Admin 可以執行此操作' };
}
```

**誰可以訪問：** 只有 Admin

**說明：** 雖然 Admin 可以訪問所有端點，但其他角色無法訪問只要求 Admin 的端點。這用於真正的管理員專屬功能。

---

#### 範例 6：允許所有角色訪問（等同於範例 4）

```typescript
// 方式 1：不指定角色（推薦）
@JWTGuard()
@Get('all-roles')
allRolesEndpoint(@CurrentUser() user: any) {
  return { message: '所有角色都可以訪問' };
}

// 方式 2：明確列出所有角色（不推薦，因為 @JWTGuard() 已經足夠）
@JWTGuard(MemberType.Admin, MemberType.User, MemberType.Merchant)
@Get('all-roles-explicit')
allRolesExplicitEndpoint(@CurrentUser() user: any) {
  return { message: '所有角色都可以訪問' };
}
```

**誰可以訪問：** User、Merchant、Admin

**說明：** 如果要允許所有角色訪問，使用 `@JWTGuard()` 即可，不需要明確列出所有角色。

## 完整 Controller 範例

```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { JWTGuard } from './decorators';
import { CurrentUser } from './decorators/current-user.decorator';
import { MemberType } from './member-type.enum';

@Controller('example')
export class ExampleController {

  // 公開端點，不需要驗證
  @Get('public')
  publicEndpoint() {
    return { message: '公開端點，無需驗證' };
  }

  // 需要 JWT 驗證，但不限制角色
  @JWTGuard()
  @Get('authenticated')
  authenticatedEndpoint(@CurrentUser() user: any) {
    return {
      message: '已驗證的使用者',
      user: user
    };
  }

  // 只允許 User 訪問（Admin 也可以）
  @JWTGuard(MemberType.User)
  @Get('user-dashboard')
  userDashboard(@CurrentUser() user: any) {
    return {
      message: 'User 儀表板',
      user: user
    };
  }

  // 只允許 Merchant 訪問（Admin 也可以）
  @JWTGuard(MemberType.Merchant)
  @Get('merchant-dashboard')
  merchantDashboard(@CurrentUser() user: any) {
    return {
      message: 'Merchant 儀表板',
      user: user
    };
  }

  // 允許 User 或 Merchant 訪問（Admin 也可以）
  @JWTGuard(MemberType.User, MemberType.Merchant)
  @Post('create-order')
  createOrder(@Body() orderData: any, @CurrentUser() user: any) {
    return {
      message: '建立訂單',
      orderData,
      user: user
    };
  }

  // 只允許 Admin 訪問
  @JWTGuard(MemberType.Admin)
  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return {
      message: `刪除使用者 ${id}`,
    };
  }
}
```

## 錯誤處理

### 1. 未提供 Token
```json
{
  "statusCode": 401,
  "message": "No token provided"
}
```

### 2. Token 無效或過期
```json
{
  "statusCode": 401,
  "message": "Invalid or expired token"
}
```

### 3. 角色權限不足
```json
{
  "statusCode": 403,
  "message": "Access denied. Required roles: user, merchant"
}
```

## 技術細節

`@JWTGuard()` 裝飾器內部會自動應用：
1. `JwtAuthGuard` - 驗證 JWT token 並將使用者資訊附加到 request 物件
2. `RolesGuard` - 檢查使用者角色是否符合要求

執行順序：
1. 先執行 JWT 驗證
2. 驗證通過後，檢查使用者角色
3. 角色符合要求才允許訪問

## 與舊版的比較

### 舊版寫法（需要分開使用多個裝飾器）：
```typescript
@UseGuards(JwtAuthGuard, AdminGuard)
@Get('admin-only')
adminEndpoint() {
  // ...
}
```

### 新版寫法（使用 JWTGuard）：
```typescript
@JWTGuard(MemberType.Admin)
@Get('admin-only')
adminEndpoint() {
  // ...
}
```

新版寫法更簡潔、更有彈性！
