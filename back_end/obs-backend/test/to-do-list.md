這是一個好問題！其實有幾種設計方式：

  目前的設計（分開的 Guard）

  JwtAuthGuard  →  驗證 Token 是否有效
  AdminGuard   →  檢查是否為 Admin 角色

  優點：
  - 單一職責，各自獨立
  - 可以靈活組合：@UseGuards(JwtAuthGuard) 或
  @UseGuards(JwtAuthGuard, AdminGuard)

  缺點：
  - 需要兩個 Guard
  - 每次都要寫兩個

  更優雅的方式：使用 Roles 裝飾器

  NestJS 常見的做法是用 自訂裝飾器 + 單一 Guard：

  // 使用方式
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  create() {}

  // 或者
  @Roles('admin', 'merchant')  // 多個角色都可以
  @UseGuards(JwtAuthGuard, RolesGuard)
  update() {}

  ---
  你想要我改成 Roles 裝飾器的方式嗎？ 這樣會更彈性，可以這樣用：

  @Roles('admin')           // 僅 Admin
  @Roles('merchant')        // 僅 Merchant
  @Roles('admin', 'merchant') // Admin 或 Merchant 都可以