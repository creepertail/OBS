# JWTGuard 流程原理說明

## 📌 概述

`@JWTGuard()` 是一個組合型裝飾器，內部整合了 **JWT 驗證**與**角色權限控制**兩個功能。本文件將詳細說明其運作流程與原理。

---

## 🏗️ 架構組成

### 1. 核心元件

```
@JWTGuard(MemberType.User, MemberType.Merchant)
    ↓
    ├── JwtAuthGuard         (驗證 JWT Token)
    ├── RolesGuard           (驗證角色權限)
    └── @Roles() Decorator   (儲存角色元數據)
```

### 2. 檔案結構

```
src/member/
├── guards/
│   ├── jwt-auth.guard.ts      # JWT 驗證 Guard
│   └── roles.guard.ts         # 角色驗證 Guard
└── decorators/
    ├── jwt-guard.decorator.ts # 組合型裝飾器
    └── roles.decorator.ts     # 角色元數據裝飾器
```

---

## 🔄 完整執行流程

### 流程圖

```
[Client Request]
    ↓
    │ Headers: Authorization: Bearer <token>
    ↓
[NestJS Interceptor Pipeline]
    ↓
╔═══════════════════════════════════════╗
║  第一階段：JWT 驗證 (JwtAuthGuard)    ║
╚═══════════════════════════════════════╝
    ↓
    ├─ 1. 從 Headers 提取 Bearer Token
    │     ↓
    ├─ 2. 使用 JwtService.verifyAsync() 驗證 Token
    │     ↓
    │     ├─ Token 無效/過期 → ❌ 拋出 401 UnauthorizedException
    │     └─ Token 有效 → ✅ 繼續
    │         ↓
    └─ 3. 將 JWT Payload 附加到 request.member
          ↓
          request.member = {
              sub: "member-uuid",
              email: "user@example.com",
              type: "user",
              iat: 1234567890,
              exp: 1234571490
          }
    ↓
╔═══════════════════════════════════════╗
║  第二階段：角色驗證 (RolesGuard)      ║
╚═══════════════════════════════════════╝
    ↓
    ├─ 1. 從元數據中讀取所需角色
    │     ↓
    │     Reflector.getAllAndOverride(ROLES_KEY)
    │     → requiredRoles = [MemberType.User, MemberType.Merchant]
    │     ↓
    ├─ 2. 檢查是否有設定角色要求
    │     ↓
    │     ├─ 沒有要求 (空陣列) → ✅ 允許通過
    │     └─ 有要求 → 繼續驗證
    │         ↓
    ├─ 3. 檢查 request.member 是否存在
    │     ↓
    │     ├─ 不存在 → ❌ 拋出 403 ForbiddenException
    │     └─ 存在 → 繼續
    │         ↓
    ├─ 4. 檢查是否為 Admin（Admin 擁有最高權限）
    │     ↓
    │     ├─ member.type === MemberType.Admin → ✅ 直接允許通過
    │     └─ 不是 Admin → 繼續檢查
    │         ↓
    └─ 5. 檢查使用者角色是否符合要求
          ↓
          requiredRoles.some(role => request.member.type === role)
          ↓
          ├─ 符合 → ✅ 允許通過
          └─ 不符合 → ❌ 拋出 403 ForbiddenException
    ↓
[Controller Handler 執行]
    ↓
[Response]
```

---

## 📝 詳細實作說明

### 階段一：JwtAuthGuard

**檔案位置：** `src/member/guards/jwt-auth.guard.ts`

```typescript
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 步驟 1: 提取 Token
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // 步驟 2: 驗證 Token
      const payload = await this.jwtService.verifyAsync(token);

      // 步驟 3: 將會員資訊附加到 request
      request['member'] = payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

**關鍵點：**
- 使用 `JwtService.verifyAsync()` 進行 Token 驗證
- 驗證通過後將 Payload 存入 `request.member`
- 驗證失敗拋出 `401 UnauthorizedException`

---

### 階段二：RolesGuard

**檔案位置：** `src/member/guards/roles.guard.ts`

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 步驟 1: 從元數據讀取所需角色
    const requiredRoles = this.reflector.getAllAndOverride<MemberType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 步驟 2: 沒有角色要求則允許通過
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const member = request.member;

    // 步驟 3: 檢查會員是否已驗證
    if (!member) {
      throw new ForbiddenException('Member not authenticated');
    }

    // 步驟 4: Admin 擁有最高權限，直接允許通過
    if (member.type === MemberType.Admin) {
      return true;
    }

    // 步驟 5: 檢查角色是否符合
    const hasRole = requiredRoles.some((role) => member.type === role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required member roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
```

**關鍵點：**
- 使用 `Reflector` 讀取由 `@Roles()` 裝飾器設定的元數據
- 依賴 `JwtAuthGuard` 已經將會員資訊存入 `request.member`
- **Admin 擁有超級權限**，可以訪問所有需要角色驗證的端點
- 支援多角色驗證（只要符合其中一個角色即可）

---

### 組合裝飾器：@JWTGuard()

**檔案位置：** `src/member/decorators/jwt-guard.decorator.ts`

```typescript
export function JWTGuard(...roles: MemberType[]) {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),  // 套用兩個 Guard
    Roles(...roles),                       // 設定角色元數據
  );
}
```

**工作原理：**

1. **`applyDecorators()`**：NestJS 提供的工具，用於合併多個裝飾器
2. **`UseGuards(JwtAuthGuard, RolesGuard)`**：依序執行兩個 Guard
3. **`Roles(...roles)`**：將角色需求儲存為元數據，供 `RolesGuard` 讀取

---

## 🔍 使用範例與流程分析

### ⚠️ 重要：Admin 超級權限規則

**Admin 擁有最高權限，可以訪問所有需要角色驗證的端點：**

1. `@JWTGuard(MemberType.User)` → **User 或 Admin** 都可以訪問
2. `@JWTGuard(MemberType.Merchant)` → **Merchant 或 Admin** 都可以訪問
3. `@JWTGuard(MemberType.User, MemberType.Merchant)` → **User、Merchant 或 Admin** 都可以訪問
4. `@JWTGuard()` → **任何已驗證的會員**都可以訪問

---

### 範例 1：只允許 User 訪問（Admin 也可以）

```typescript
@JWTGuard(MemberType.User)
@Get('user-only')
userOnlyEndpoint(@CurrentUser() user: any) {
  return { message: '只有 User 可以訪問', user };
}
```

**執行流程（User 訪問）：**

```
Client 發送請求 (type = "user")
    ↓
Headers: { Authorization: "Bearer eyJhbGc..." }
    ↓
[JwtAuthGuard]
    ✓ Token 驗證通過
    ✓ request.member = { sub: "xxx", type: "user", ... }
    ↓
[RolesGuard]
    ✓ requiredRoles = [MemberType.User]
    ✓ member.type = "user"
    ✗ 不是 Admin，繼續檢查角色
    ✓ "user" 在 [MemberType.User] 中
    ✓ 允許通過
    ↓
[Controller Handler]
    執行函式並回傳資料
```

**執行流程（Admin 訪問）：**

```
Client 發送請求 (type = "admin")
    ↓
Headers: { Authorization: "Bearer eyJhbGc..." }
    ↓
[JwtAuthGuard]
    ✓ Token 驗證通過
    ✓ request.member = { sub: "xxx", type: "admin", ... }
    ↓
[RolesGuard]
    ✓ requiredRoles = [MemberType.User]
    ✓ member.type = "admin"
    ✓ 是 Admin，擁有超級權限
    ✓ 直接允許通過（不檢查 requiredRoles）
    ↓
[Controller Handler]
    執行函式並回傳資料
```

---

### 範例 2：只允許 Merchant 訪問（Admin 也可以）

```typescript
@JWTGuard(MemberType.Merchant)
@Post('books')
createBook(@Body() bookData: any, @CurrentUser() user: any) {
  return { message: '建立書籍', bookData };
}
```

**執行流程（Merchant 訪問）：**

```
Client 發送請求 (type = "merchant")
    ↓
[JwtAuthGuard]
    ✓ Token 驗證通過
    ✓ request.member = { sub: "xxx", type: "merchant", ... }
    ↓
[RolesGuard]
    ✓ requiredRoles = [MemberType.Merchant]
    ✓ member.type = "merchant"
    ✗ 不是 Admin，繼續檢查角色
    ✓ "merchant" 在 [MemberType.Merchant] 中
    ✓ 允許通過
    ↓
[Controller Handler]
    執行函式
```

**執行流程（Admin 訪問）：**

```
Client 發送請求 (type = "admin")
    ↓
[JwtAuthGuard]
    ✓ Token 驗證通過
    ✓ request.member = { sub: "xxx", type: "admin", ... }
    ↓
[RolesGuard]
    ✓ requiredRoles = [MemberType.Merchant]
    ✓ member.type = "admin"
    ✓ 是 Admin，擁有超級權限
    ✓ 直接允許通過
    ↓
[Controller Handler]
    執行函式
```

---

### 範例 3：允許 User 或 Merchant 訪問（Admin 也可以）

```typescript
@JWTGuard(MemberType.User, MemberType.Merchant)
@Post('create-order')
createOrder(@Body() orderData: any, @CurrentUser() user: any) {
  return { message: '建立訂單', orderData };
}
```

**執行流程：**

```
假設 Token 中的 type = "merchant"

[JwtAuthGuard]
    ✓ Token 驗證通過
    ✓ request.member = { sub: "xxx", type: "merchant", ... }
    ↓
[RolesGuard]
    ✓ requiredRoles = [MemberType.User, MemberType.Merchant]
    ✓ member.type = "merchant"
    ✗ 不是 Admin，繼續檢查角色
    ✓ "merchant" 在 [MemberType.User, MemberType.Merchant] 中
    ✓ 允許通過
    ↓
[Controller Handler]
    執行函式
```

---

### 範例 4：只驗證 JWT，不限制角色

```typescript
@JWTGuard()
@Get('authenticated')
authenticatedEndpoint(@CurrentUser() user: any) {
  return { message: '任何已登入的使用者都可以訪問' };
}
```

**執行流程：**

```
[JwtAuthGuard]
    ✓ Token 驗證通過
    ✓ request.member = { sub: "xxx", type: "admin", ... }
    ↓
[RolesGuard]
    ✓ requiredRoles = [] (空陣列)
    ✓ 沒有角色要求，直接允許通過
    ↓
[Controller Handler]
    執行函式
```

---

## ❌ 錯誤處理機制

### 1. 未提供 Token

```
Client Request (無 Authorization Header)
    ↓
[JwtAuthGuard]
    ✗ extractTokenFromHeader() 回傳 undefined
    ↓
拋出 UnauthorizedException
    ↓
Response: {
  "statusCode": 401,
  "message": "No token provided"
}
```

---

### 2. Token 無效或過期

```
Client Request (Token 已過期)
    ↓
[JwtAuthGuard]
    ✗ jwtService.verifyAsync() 拋出錯誤
    ↓
拋出 UnauthorizedException
    ↓
Response: {
  "statusCode": 401,
  "message": "Invalid or expired token"
}
```

---

### 3. 角色權限不符

```
Client Request (type = "user"，但要求 "admin")
    ↓
[JwtAuthGuard]
    ✓ Token 驗證通過
    ✓ request.member = { type: "user", ... }
    ↓
[RolesGuard]
    ✗ requiredRoles = [MemberType.Admin]
    ✗ member.type = "user"
    ✗ "user" 不在 [MemberType.Admin] 中
    ↓
拋出 ForbiddenException
    ↓
Response: {
  "statusCode": 403,
  "message": "Access denied. Required member roles: admin"
}
```

---

## 🔐 安全性考量

### 1. Token 驗證的安全性

- **使用 HTTPS**：確保 Token 在傳輸過程中加密
- **Token 過期時間**：建議設定合理的過期時間（如 1 小時）
- **Secret Key 安全**：JWT Secret 應存放在環境變數中，不可硬編碼

### 2. 角色驗證的安全性

- **最小權限原則**：只給予必要的角色權限
- **角色分離**：User、Merchant、Admin 各司其職
- **多層驗證**：除了角色驗證，Service 層也應進行業務邏輯驗證

---

## 🎯 設計優勢

### 1. **關注點分離 (Separation of Concerns)**

```
JwtAuthGuard  → 只負責 JWT 驗證
RolesGuard    → 只負責角色檢查
@JWTGuard()   → 組合兩者，提供簡潔介面
```

### 2. **可重用性 (Reusability)**

- `JwtAuthGuard` 和 `RolesGuard` 可以獨立使用
- `@JWTGuard()` 可在任何 Controller 中重複使用

### 3. **易於擴展 (Extensibility)**

如果未來需要新增權限檢查（如檢查 IP、檢查訂閱狀態），只需：

```typescript
export function JWTGuard(...roles: MemberType[]) {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard, IpWhitelistGuard),  // 新增 Guard
    Roles(...roles),
  );
}
```

### 4. **清晰的 API 介面**

```typescript
// 清楚表達：此端點需要 User 或 Merchant 角色
@JWTGuard(MemberType.User, MemberType.Merchant)
```

---

## 📚 相關檔案索引

- `jwt-auth.guard.ts` - JWT 驗證邏輯
- `roles.guard.ts` - 角色驗證邏輯
- `jwt-guard.decorator.ts` - 組合型裝飾器
- `roles.decorator.ts` - 角色元數據裝飾器
- `current-user.decorator.ts` - 取得當前會員裝飾器
- `member-type.enum.ts` - 會員類型定義

---

## 🔗 NestJS Guards 官方文檔

- [Guards](https://docs.nestjs.com/guards)
- [Authentication](https://docs.nestjs.com/security/authentication)
- [Authorization](https://docs.nestjs.com/security/authorization)

---

**最後更新日期：** 2025-12-01
