# 線上書城前端建置指南 (Vue.js 3 + TypeScript)

## 📋 目錄
1. [環境準備](#環境準備)
2. [專案初始化](#專案初始化)
3. [專案結構](#專案結構)
4. [開發步驟](#開發步驟)
5. [頁面設計](#頁面設計)
6. [API 整合](#api-整合)
7. [路由設定](#路由設定)
8. [狀態管理](#狀態管理)

---

## 🔧 環境準備

### 必要工具
- Node.js (v18+)
- npm 或 yarn
- VS Code (推薦)
- 已完成的後端 API (參考 `BACKEND_SETUP_GUIDE.md`)

### VS Code 推薦擴充套件
- Volar (取代 Vetur，用於 Vue 3)
- TypeScript Vue Plugin (Volar)
- ESLint
- Prettier
- Tailwind CSS IntelliSense (如果使用 Tailwind)

---

## 🚀 專案初始化

### Step 1: 使用 Vite 建立 Vue 3 專案

```bash
# 使用 npm 建立專案
npm create vue@latest

# 互動式問答選擇：
# ✔ Project name: obs-frontend
# ✔ Add TypeScript? Yes
# ✔ Add JSX Support? No
# ✔ Add Vue Router for Single Page Application development? Yes
# ✔ Add Pinia for state management? Yes
# ✔ Add Vitest for Unit Testing? No (可選)
# ✔ Add an End-to-End Testing Solution? No (可選)
# ✔ Add ESLint for code quality? Yes
# ✔ Add Prettier for code formatting? Yes

# 進入專案目錄
cd obs-frontend
```

### Step 2: 安裝必要套件

```bash
# 安裝基礎依賴
npm install

# 安裝 HTTP 請求套件
npm install axios

# 安裝 UI 框架 (選擇其中一個)
# 方案 1: Element Plus (推薦，功能完整)
npm install element-plus @element-plus/icons-vue

# 方案 2: Naive UI (輕量級)
npm install naive-ui

# 方案 3: 使用 Tailwind CSS (自訂性高)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 安裝日期處理套件
npm install dayjs

# 安裝表單驗證
npm install vee-validate yup
```

### Step 3: 設定環境變數

建立 `.env.development` 檔案（開發環境）：
```env
# API 後端位址
VITE_API_BASE_URL=http://localhost:3000

# 其他設定
VITE_APP_TITLE=線上書城
```

建立 `.env.production` 檔案（正式環境）：
```env
# 正式環境 API 位址
VITE_API_BASE_URL=https://your-api-domain.com

VITE_APP_TITLE=線上書城
```

---

## 📁 專案結構

```
obs-frontend/
├── public/                      # 靜態資源
│   └── favicon.ico
├── src/
│   ├── assets/                  # 資源檔案
│   │   ├── images/
│   │   ├── styles/
│   │   │   └── main.css
│   │   └── logo.png
│   ├── components/              # 共用組件
│   │   ├── common/              # 通用組件
│   │   │   ├── Header.vue
│   │   │   ├── Footer.vue
│   │   │   ├── Loading.vue
│   │   │   └── Pagination.vue
│   │   ├── book/                # 書籍相關組件
│   │   │   ├── BookCard.vue
│   │   │   ├── BookList.vue
│   │   │   └── BookDetail.vue
│   │   └── cart/                # 購物車組件
│   │       ├── CartItem.vue
│   │       └── CartSummary.vue
│   ├── views/                   # 頁面組件
│   │   ├── Home.vue             # 首頁
│   │   ├── auth/
│   │   │   ├── Login.vue        # 登入頁
│   │   │   └── Register.vue     # 註冊頁
│   │   ├── books/
│   │   │   ├── BookList.vue     # 書籍列表
│   │   │   ├── BookDetail.vue   # 書籍詳情
│   │   │   └── BookSearch.vue   # 書籍搜尋
│   │   ├── cart/
│   │   │   └── ShoppingCart.vue # 購物車頁
│   │   ├── orders/
│   │   │   ├── OrderList.vue    # 訂單列表
│   │   │   ├── OrderDetail.vue  # 訂單詳情
│   │   │   └── Checkout.vue     # 結帳頁
│   │   ├── user/
│   │   │   └── Profile.vue      # 個人資料
│   │   └── admin/
│   │       ├── Dashboard.vue    # 管理後台
│   │       ├── BookManage.vue   # 書籍管理
│   │       └── OrderManage.vue  # 訂單管理
│   ├── router/                  # 路由設定
│   │   └── index.ts
│   ├── stores/                  # Pinia 狀態管理
│   │   ├── auth.ts              # 認證狀態
│   │   ├── cart.ts              # 購物車狀態
│   │   ├── book.ts              # 書籍狀態
│   │   └── order.ts             # 訂單狀態
│   ├── api/                     # API 請求
│   │   ├── axios.ts             # axios 設定
│   │   ├── auth.ts              # 認證 API
│   │   ├── books.ts             # 書籍 API
│   │   ├── cart.ts              # 購物車 API
│   │   └── orders.ts            # 訂單 API
│   ├── types/                   # TypeScript 型別定義
│   │   ├── user.ts
│   │   ├── book.ts
│   │   ├── cart.ts
│   │   └── order.ts
│   ├── utils/                   # 工具函數
│   │   ├── format.ts            # 格式化工具
│   │   ├── storage.ts           # 本地儲存工具
│   │   └── validators.ts        # 驗證工具
│   ├── App.vue                  # 根組件
│   └── main.ts                  # 應用程式入口
├── .env.development             # 開發環境變數
├── .env.production              # 正式環境變數
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🔨 開發步驟

### Phase 1: 基礎設定

#### 1. 設定 Axios (API 請求工具)

建立 `src/api/axios.ts`：
```typescript
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

// 建立 axios 實例
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 請求攔截器：加入 JWT token
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const token = authStore.token

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 回應攔截器：處理錯誤
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          ElMessage.error('請先登入')
          const authStore = useAuthStore()
          authStore.logout()
          break
        case 403:
          ElMessage.error('沒有權限')
          break
        case 404:
          ElMessage.error('資源不存在')
          break
        case 500:
          ElMessage.error('伺服器錯誤')
          break
        default:
          ElMessage.error(error.response.data.message || '發生錯誤')
      }
    } else {
      ElMessage.error('網路錯誤，請稍後再試')
    }

    return Promise.reject(error)
  }
)

export default apiClient
```

#### 2. 定義 TypeScript 型別

建立 `src/types/user.ts`：
```typescript
export interface User {
  user_id: number
  email: string
  username: string
  phone?: string
  role: 'customer' | 'admin'
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  username: string
  phone?: string
}

export interface LoginResponse {
  access_token: string
  user: User
}
```

建立 `src/types/book.ts`：
```typescript
export interface Book {
  book_id: number
  isbn?: string
  title: string
  author?: string
  publisher?: string
  publication_date?: string
  price: number
  stock_quantity: number
  category?: string
  description?: string
  cover_image?: string
  created_at: string
  updated_at: string
}

export interface CreateBookDto {
  isbn?: string
  title: string
  author?: string
  publisher?: string
  publication_date?: string
  price: number
  stock_quantity: number
  category?: string
  description?: string
  cover_image?: string
}

export interface SearchBookParams {
  keyword?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  page?: number
  limit?: number
}
```

建立 `src/types/cart.ts`：
```typescript
import type { Book } from './book'

export interface CartItem {
  cart_id: number
  user_id: number
  book_id: number
  quantity: number
  added_at: string
  book?: Book  // 關聯的書籍資訊
}

export interface AddToCartDto {
  book_id: number
  quantity: number
}
```

建立 `src/types/order.ts`：
```typescript
import type { Book } from './book'

export interface Order {
  order_id: number
  user_id: number
  total_amount: number
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'
  shipping_address: string
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  order_item_id: number
  order_id: number
  book_id: number
  quantity: number
  unit_price: number
  subtotal: number
  book?: Book
}

export interface CreateOrderDto {
  shipping_address: string
  items: {
    book_id: number
    quantity: number
  }[]
}
```

#### 3. 建立 API 請求函數

建立 `src/api/auth.ts`：
```typescript
import apiClient from './axios'
import type { LoginCredentials, RegisterData, LoginResponse, User } from '@/types/user'

export const authAPI = {
  // 註冊
  register: (data: RegisterData) => {
    return apiClient.post<User>('/auth/register', data)
  },

  // 登入
  login: (credentials: LoginCredentials) => {
    return apiClient.post<LoginResponse>('/auth/login', credentials)
  },

  // 取得個人資料
  getProfile: () => {
    return apiClient.get<User>('/users/profile')
  },

  // 更新個人資料
  updateProfile: (data: Partial<User>) => {
    return apiClient.patch<User>('/users/profile', data)
  }
}
```

建立 `src/api/books.ts`：
```typescript
import apiClient from './axios'
import type { Book, CreateBookDto, SearchBookParams } from '@/types/book'

export const booksAPI = {
  // 取得所有書籍
  getAll: () => {
    return apiClient.get<Book[]>('/books')
  },

  // 取得單一書籍
  getOne: (id: number) => {
    return apiClient.get<Book>(`/books/${id}`)
  },

  // 搜尋書籍
  search: (params: SearchBookParams) => {
    return apiClient.get<Book[]>('/books/search', { params })
  },

  // 新增書籍（管理員）
  create: (data: CreateBookDto) => {
    return apiClient.post<Book>('/books', data)
  },

  // 更新書籍（管理員）
  update: (id: number, data: Partial<CreateBookDto>) => {
    return apiClient.patch<Book>(`/books/${id}`, data)
  },

  // 刪除書籍（管理員）
  delete: (id: number) => {
    return apiClient.delete(`/books/${id}`)
  }
}
```

建立 `src/api/cart.ts`：
```typescript
import apiClient from './axios'
import type { CartItem, AddToCartDto } from '@/types/cart'

export const cartAPI = {
  // 取得購物車
  getCart: () => {
    return apiClient.get<CartItem[]>('/cart')
  },

  // 加入購物車
  addToCart: (data: AddToCartDto) => {
    return apiClient.post<CartItem>('/cart', data)
  },

  // 更新購物車數量
  updateQuantity: (cartId: number, quantity: number) => {
    return apiClient.patch<CartItem>(`/cart/${cartId}`, { quantity })
  },

  // 移除購物車項目
  removeItem: (cartId: number) => {
    return apiClient.delete(`/cart/${cartId}`)
  },

  // 清空購物車
  clearCart: () => {
    return apiClient.delete('/cart')
  }
}
```

建立 `src/api/orders.ts`：
```typescript
import apiClient from './axios'
import type { Order, CreateOrderDto } from '@/types/order'

export const ordersAPI = {
  // 建立訂單
  create: (data: CreateOrderDto) => {
    return apiClient.post<Order>('/orders', data)
  },

  // 取得訂單列表
  getAll: () => {
    return apiClient.get<Order[]>('/orders')
  },

  // 取得訂單詳情
  getOne: (id: number) => {
    return apiClient.get<Order>(`/orders/${id}`)
  },

  // 更新訂單狀態（管理員）
  updateStatus: (id: number, status: Order['status']) => {
    return apiClient.patch<Order>(`/orders/${id}/status`, { status })
  }
}
```

#### 4. 設定 Pinia 狀態管理

建立 `src/stores/auth.ts`：
```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/api/auth'
import type { User, LoginCredentials, RegisterData } from '@/types/user'
import { ElMessage } from 'element-plus'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Actions
  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authAPI.login(credentials)
      token.value = response.data.access_token
      user.value = response.data.user
      localStorage.setItem('token', response.data.access_token)
      ElMessage.success('登入成功')
      router.push('/')
    } catch (error) {
      ElMessage.error('登入失敗')
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      await authAPI.register(data)
      ElMessage.success('註冊成功，請登入')
      router.push('/login')
    } catch (error) {
      ElMessage.error('註冊失敗')
      throw error
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    ElMessage.info('已登出')
    router.push('/login')
  }

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile()
      user.value = response.data
    } catch (error) {
      logout()
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    fetchProfile
  }
})
```

建立 `src/stores/cart.ts`：
```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { cartAPI } from '@/api/cart'
import type { CartItem, AddToCartDto } from '@/types/cart'
import { ElMessage } from 'element-plus'

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref<CartItem[]>([])
  const loading = ref(false)

  // Getters
  const itemCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => {
      return sum + (item.book?.price || 0) * item.quantity
    }, 0)
  })

  // Actions
  const fetchCart = async () => {
    loading.value = true
    try {
      const response = await cartAPI.getCart()
      items.value = response.data
    } catch (error) {
      ElMessage.error('載入購物車失敗')
    } finally {
      loading.value = false
    }
  }

  const addToCart = async (data: AddToCartDto) => {
    try {
      await cartAPI.addToCart(data)
      await fetchCart()
      ElMessage.success('已加入購物車')
    } catch (error) {
      ElMessage.error('加入購物車失敗')
    }
  }

  const updateQuantity = async (cartId: number, quantity: number) => {
    try {
      await cartAPI.updateQuantity(cartId, quantity)
      await fetchCart()
    } catch (error) {
      ElMessage.error('更新數量失敗')
    }
  }

  const removeItem = async (cartId: number) => {
    try {
      await cartAPI.removeItem(cartId)
      await fetchCart()
      ElMessage.success('已移除商品')
    } catch (error) {
      ElMessage.error('移除商品失敗')
    }
  }

  const clearCart = async () => {
    try {
      await cartAPI.clearCart()
      items.value = []
      ElMessage.success('購物車已清空')
    } catch (error) {
      ElMessage.error('清空購物車失敗')
    }
  }

  return {
    items,
    loading,
    itemCount,
    totalPrice,
    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart
  }
})
```

#### 5. 設定路由

建立 `src/router/index.ts`：
```typescript
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/Login.vue'),
      meta: { guest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/Register.vue'),
      meta: { guest: true }
    },
    {
      path: '/books',
      name: 'books',
      component: () => import('@/views/books/BookList.vue')
    },
    {
      path: '/books/:id',
      name: 'book-detail',
      component: () => import('@/views/books/BookDetail.vue')
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/views/cart/ShoppingCart.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('@/views/orders/Checkout.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('@/views/orders/OrderList.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/orders/:id',
      name: 'order-detail',
      component: () => import('@/views/orders/OrderDetail.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/user/Profile.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/admin/Dashboard.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    }
  ]
})

// 路由守衛
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 需要登入的頁面
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }

  // 需要管理員權限的頁面
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/')
    return
  }

  // 已登入不能訪問登入/註冊頁
  if (to.meta.guest && authStore.isAuthenticated) {
    next('/')
    return
  }

  next()
})

export default router
```

#### 6. 設定 main.ts

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import './assets/styles/main.css'

const app = createApp(App)

// 註冊 Element Plus 圖示
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')
```

#### 7. Phase 1 完成檢查清單

- [ ] Vue 3 專案建立完成
- [ ] 必要套件安裝完成（axios, Element Plus, Pinia 等）
- [ ] `.env.development` 環境變數設定完成
- [ ] TypeScript 型別定義建立完成
- [ ] Axios 設定完成（攔截器、錯誤處理）
- [ ] API 請求函數建立完成
- [ ] Pinia 狀態管理建立完成
- [ ] 路由設定完成（包含路由守衛）
- [ ] `main.ts` 設定完成
- [ ] 執行 `npm run dev` 成功啟動

**🎉 恭喜！Phase 1 完成，可以開始 Phase 2 了！**

---

### Phase 2: 建立頁面組件

#### 1. 登入頁面

建立 `src/views/auth/Login.vue`：
```vue
<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2>會員登入</h2>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="Email" prop="email">
          <el-input
            v-model="form.email"
            type="email"
            placeholder="請輸入 Email"
          />
        </el-form-item>

        <el-form-item label="密碼" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="請輸入密碼"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="handleLogin"
            style="width: 100%"
          >
            登入
          </el-button>
        </el-form-item>

        <el-form-item>
          <router-link to="/register">還沒有帳號？立即註冊</router-link>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { FormInstance, FormRules } from 'element-plus'

const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  email: '',
  password: ''
})

const rules: FormRules = {
  email: [
    { required: true, message: '請輸入 Email', trigger: 'blur' },
    { type: 'email', message: '請輸入正確的 Email 格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    { min: 6, message: '密碼至少 6 個字元', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await authStore.login(form)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin: 0;
}
</style>
```

#### 2. 註冊頁面

建立 `src/views/auth/Register.vue`：
```vue
<template>
  <div class="register-container">
    <el-card class="register-card">
      <template #header>
        <h2>會員註冊</h2>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="Email" prop="email">
          <el-input
            v-model="form.email"
            type="email"
            placeholder="請輸入 Email"
          />
        </el-form-item>

        <el-form-item label="使用者名稱" prop="username">
          <el-input
            v-model="form.username"
            placeholder="請輸入使用者名稱"
          />
        </el-form-item>

        <el-form-item label="密碼" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="請輸入密碼"
            show-password
          />
        </el-form-item>

        <el-form-item label="確認密碼" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="請再次輸入密碼"
            show-password
          />
        </el-form-item>

        <el-form-item label="手機" prop="phone">
          <el-input
            v-model="form.phone"
            placeholder="請輸入手機號碼（選填）"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="handleRegister"
            style="width: 100%"
          >
            註冊
          </el-button>
        </el-form-item>

        <el-form-item>
          <router-link to="/login">已有帳號？立即登入</router-link>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { FormInstance, FormRules } from 'element-plus'

const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
  phone: ''
})

const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value !== form.password) {
    callback(new Error('兩次輸入的密碼不一致'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  email: [
    { required: true, message: '請輸入 Email', trigger: 'blur' },
    { type: 'email', message: '請輸入正確的 Email 格式', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '請輸入使用者名稱', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    { min: 6, message: '密碼至少 6 個字元', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '請確認密碼', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const { confirmPassword, ...data } = form
        await authStore.register(data)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 500px;
}

h2 {
  text-align: center;
  margin: 0;
}
</style>
```

#### 3. 書籍列表頁面

建立 `src/views/books/BookList.vue`：
```vue
<template>
  <div class="book-list-container">
    <h1>書籍列表</h1>

    <!-- 搜尋欄 -->
    <el-card class="search-card">
      <el-form :inline="true">
        <el-form-item label="關鍵字">
          <el-input
            v-model="searchParams.keyword"
            placeholder="搜尋書名、作者"
            clearable
          />
        </el-form-item>

        <el-form-item label="分類">
          <el-select
            v-model="searchParams.category"
            placeholder="選擇分類"
            clearable
          >
            <el-option label="全部" value="" />
            <el-option label="程式設計" value="程式設計" />
            <el-option label="文學小說" value="文學小說" />
            <el-option label="商業理財" value="商業理財" />
            <el-option label="藝術設計" value="藝術設計" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜尋</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 書籍列表 -->
    <el-row :gutter="20" v-loading="loading">
      <el-col
        v-for="book in books"
        :key="book.book_id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
      >
        <el-card class="book-card" shadow="hover">
          <img
            :src="book.cover_image || '/placeholder-book.png'"
            class="book-cover"
            :alt="book.title"
          />
          <h3>{{ book.title }}</h3>
          <p class="author">{{ book.author }}</p>
          <p class="price">NT$ {{ book.price }}</p>
          <p class="stock">庫存: {{ book.stock_quantity }}</p>

          <div class="actions">
            <el-button
              type="primary"
              size="small"
              @click="viewDetail(book.book_id)"
            >
              查看詳情
            </el-button>
            <el-button
              type="success"
              size="small"
              :disabled="book.stock_quantity === 0"
              @click="addToCart(book.book_id)"
            >
              加入購物車
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="!loading && books.length === 0" description="沒有找到書籍" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { booksAPI } from '@/api/books'
import { useCartStore } from '@/stores/cart'
import type { Book } from '@/types/book'
import { ElMessage } from 'element-plus'

const router = useRouter()
const cartStore = useCartStore()

const books = ref<Book[]>([])
const loading = ref(false)

const searchParams = reactive({
  keyword: '',
  category: ''
})

const fetchBooks = async () => {
  loading.value = true
  try {
    const response = await booksAPI.getAll()
    books.value = response.data
  } catch (error) {
    ElMessage.error('載入書籍失敗')
  } finally {
    loading.value = false
  }
}

const handleSearch = async () => {
  loading.value = true
  try {
    const response = await booksAPI.search(searchParams)
    books.value = response.data
  } catch (error) {
    ElMessage.error('搜尋失敗')
  } finally {
    loading.value = false
  }
}

const viewDetail = (bookId: number) => {
  router.push(`/books/${bookId}`)
}

const addToCart = async (bookId: number) => {
  await cartStore.addToCart({ book_id: bookId, quantity: 1 })
}

onMounted(() => {
  fetchBooks()
})
</script>

<style scoped>
.book-list-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.book-card {
  margin-bottom: 20px;
  text-align: center;
}

.book-cover {
  width: 100%;
  height: 250px;
  object-fit: cover;
  margin-bottom: 10px;
}

h3 {
  font-size: 16px;
  margin: 10px 0;
  min-height: 40px;
}

.author {
  color: #666;
  font-size: 14px;
}

.price {
  color: #e4393c;
  font-size: 20px;
  font-weight: bold;
  margin: 10px 0;
}

.stock {
  color: #999;
  font-size: 12px;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 15px;
}
</style>
```

#### 4. 購物車頁面

建立 `src/views/cart/ShoppingCart.vue`：
```vue
<template>
  <div class="cart-container">
    <h1>購物車</h1>

    <el-card v-loading="cartStore.loading">
      <el-empty v-if="cartStore.items.length === 0" description="購物車是空的">
        <el-button type="primary" @click="router.push('/books')">
          前往選購
        </el-button>
      </el-empty>

      <div v-else>
        <!-- 購物車項目 -->
        <el-table :data="cartStore.items" style="width: 100%">
          <el-table-column label="書籍" min-width="300">
            <template #default="{ row }">
              <div class="book-info">
                <img
                  :src="row.book?.cover_image || '/placeholder-book.png'"
                  class="book-thumbnail"
                  :alt="row.book?.title"
                />
                <div>
                  <p class="book-title">{{ row.book?.title }}</p>
                  <p class="book-author">{{ row.book?.author }}</p>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="單價" width="120">
            <template #default="{ row }">
              NT$ {{ row.book?.price }}
            </template>
          </el-table-column>

          <el-table-column label="數量" width="180">
            <template #default="{ row }">
              <el-input-number
                :model-value="row.quantity"
                :min="1"
                :max="row.book?.stock_quantity"
                @change="(val) => updateQuantity(row.cart_id, val)"
              />
            </template>
          </el-table-column>

          <el-table-column label="小計" width="120">
            <template #default="{ row }">
              NT$ {{ (row.book?.price || 0) * row.quantity }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button
                type="danger"
                size="small"
                @click="removeItem(row.cart_id)"
              >
                刪除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 總計 -->
        <div class="cart-summary">
          <el-divider />
          <div class="summary-row">
            <span>商品總數：</span>
            <span>{{ cartStore.itemCount }} 件</span>
          </div>
          <div class="summary-row total">
            <span>總金額：</span>
            <span class="total-price">NT$ {{ cartStore.totalPrice }}</span>
          </div>

          <div class="cart-actions">
            <el-button @click="router.push('/books')">
              繼續購物
            </el-button>
            <el-button type="danger" @click="clearCart">
              清空購物車
            </el-button>
            <el-button type="primary" size="large" @click="checkout">
              前往結帳
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const cartStore = useCartStore()

const updateQuantity = async (cartId: number, quantity: number) => {
  await cartStore.updateQuantity(cartId, quantity)
}

const removeItem = async (cartId: number) => {
  await ElMessageBox.confirm('確定要刪除此商品嗎？', '提示', {
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  await cartStore.removeItem(cartId)
}

const clearCart = async () => {
  await ElMessageBox.confirm('確定要清空購物車嗎？', '提示', {
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  await cartStore.clearCart()
}

const checkout = () => {
  router.push('/checkout')
}

onMounted(() => {
  cartStore.fetchCart()
})
</script>

<style scoped>
.cart-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 20px;
}

.book-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.book-thumbnail {
  width: 60px;
  height: 80px;
  object-fit: cover;
}

.book-title {
  font-weight: bold;
  margin: 0;
}

.book-author {
  color: #666;
  font-size: 14px;
  margin: 5px 0 0 0;
}

.cart-summary {
  margin-top: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  font-size: 16px;
}

.summary-row.total {
  font-size: 20px;
  font-weight: bold;
}

.total-price {
  color: #e4393c;
  font-size: 24px;
}

.cart-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>
```

#### 5. 共用組件 - Header

建立 `src/components/common/Header.vue`：
```vue
<template>
  <el-header class="app-header">
    <div class="header-content">
      <!-- Logo -->
      <div class="logo" @click="router.push('/')">
        <h2>線上書城</h2>
      </div>

      <!-- 導航選單 -->
      <el-menu
        :default-active="activeMenu"
        mode="horizontal"
        :ellipsis="false"
        router
      >
        <el-menu-item index="/">首頁</el-menu-item>
        <el-menu-item index="/books">書籍列表</el-menu-item>

        <div class="flex-grow" />

        <!-- 購物車 -->
        <el-menu-item index="/cart">
          <el-badge :value="cartStore.itemCount" :hidden="cartStore.itemCount === 0">
            <el-icon><ShoppingCart /></el-icon>
            購物車
          </el-badge>
        </el-menu-item>

        <!-- 使用者選單 -->
        <el-sub-menu v-if="authStore.isAuthenticated" index="user">
          <template #title>
            <el-icon><User /></el-icon>
            {{ authStore.user?.username }}
          </template>
          <el-menu-item index="/profile">個人資料</el-menu-item>
          <el-menu-item index="/orders">訂單查詢</el-menu-item>
          <el-menu-item v-if="authStore.isAdmin" index="/admin">管理後台</el-menu-item>
          <el-menu-item @click="handleLogout">登出</el-menu-item>
        </el-sub-menu>

        <el-menu-item v-else index="/login">登入</el-menu-item>
      </el-menu>
    </div>
  </el-header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { ShoppingCart, User } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const cartStore = useCartStore()

const activeMenu = computed(() => route.path)

const handleLogout = () => {
  authStore.logout()
}
</script>

<style scoped>
.app-header {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  height: 100%;
}

.logo {
  cursor: pointer;
  margin-right: 30px;
}

.logo h2 {
  margin: 0;
  color: #409eff;
}

.flex-grow {
  flex-grow: 1;
}

.el-menu {
  flex: 1;
  border-bottom: none;
}
</style>
```

#### 6. 更新 App.vue

```vue
<template>
  <el-container class="app-container">
    <Header />
    <el-main>
      <router-view />
    </el-main>
    <el-footer>
      <p>&copy; 2025 線上書城. All rights reserved.</p>
    </el-footer>
  </el-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Header from './components/common/Header.vue'
import { useAuthStore } from './stores/auth'
import { useCartStore } from './stores/cart'

const authStore = useAuthStore()
const cartStore = useCartStore()

onMounted(() => {
  // 如果有 token，載入使用者資料和購物車
  if (authStore.token) {
    authStore.fetchProfile()
    cartStore.fetchCart()
  }
})
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-container {
  min-height: 100vh;
}

.el-main {
  background-color: #f5f5f5;
  min-height: calc(100vh - 120px);
}

.el-footer {
  text-align: center;
  background-color: #fff;
  border-top: 1px solid #eee;
}
</style>
```

---

## 🧪 測試與除錯

### 1. 啟動開發伺服器

```bash
# 確保後端 API 已經啟動（Port 3000）
cd ../obs-backend
npm run start:dev

# 另開一個終端，啟動前端
cd obs-frontend
npm run dev

# 預期輸出：
# VITE v5.x.x  ready in xxx ms
# ➜  Local:   http://localhost:5173/
```

### 2. 測試流程

1. **註冊測試**
   - 訪問 `http://localhost:5173/register`
   - 填寫註冊資料並提交
   - 檢查是否跳轉到登入頁

2. **登入測試**
   - 使用剛註冊的帳號登入
   - 檢查 localStorage 是否存有 token
   - 檢查 Header 是否顯示使用者名稱

3. **書籍列表測試**
   - 訪問 `/books` 查看書籍列表
   - 測試搜尋功能
   - 測試加入購物車

4. **購物車測試**
   - 查看購物車內容
   - 測試數量調整
   - 測試刪除商品

### 3. 常見問題排除

| 問題 | 原因 | 解決方法 |
|------|------|----------|
| `CORS Error` | 後端未設定 CORS | 檢查後端 `main.ts` 的 CORS 設定 |
| `401 Unauthorized` | Token 過期或無效 | 重新登入 |
| `Network Error` | 後端未啟動 | 確認後端在 Port 3000 運行 |
| `Cannot find module '@/xxx'` | 路徑別名未設定 | 檢查 `vite.config.ts` 和 `tsconfig.json` |

---

## 📦 打包部署

### 開發環境
```bash
npm run dev
```

### 正式環境打包
```bash
npm run build

# 打包後的檔案在 dist/ 目錄
# 可以部署到 Nginx、Apache 或任何靜態檔案伺服器
```

### 預覽打包結果
```bash
npm run preview
```

---

## 📝 開發檢查清單

### Phase 1: 基礎設定
- [ ] Vue 3 專案建立
- [ ] TypeScript 型別定義
- [ ] Axios 設定與攔截器
- [ ] Pinia 狀態管理
- [ ] Vue Router 設定
- [ ] Element Plus 整合

### Phase 2: 頁面開發
- [ ] 登入/註冊頁面
- [ ] 書籍列表頁面
- [ ] 書籍詳情頁面
- [ ] 購物車頁面
- [ ] 結帳頁面
- [ ] 訂單列表頁面
- [ ] 個人資料頁面
- [ ] 管理後台（管理員）

### Phase 3: 功能完善
- [ ] 表單驗證
- [ ] 錯誤處理
- [ ] Loading 狀態
- [ ] 響應式設計（RWD）
- [ ] 路由守衛（權限控制）
- [ ] API 整合測試
- [ ] 效能優化

---

## 🎨 UI/UX 優化建議

1. **Loading 狀態**
   - 使用 `v-loading` 指令
   - 按鈕加入 `:loading` 屬性

2. **錯誤提示**
   - 使用 `ElMessage` 統一提示
   - 表單驗證即時回饋

3. **響應式設計**
   - 使用 Element Plus 的 Grid 系統
   - 手機版優化

4. **使用者體驗**
   - 加入麵包屑導航
   - 加入返回頂部按鈕
   - 加入商品收藏功能

---

## 📚 參考資源

- [Vue 3 官方文件](https://vuejs.org/)
- [Pinia 官方文件](https://pinia.vuejs.org/)
- [Vue Router 官方文件](https://router.vuejs.org/)
- [Element Plus 官方文件](https://element-plus.org/)
- [Vite 官方文件](https://vitejs.dev/)
- [Axios 文件](https://axios-http.com/)

---

祝你開發順利！🎉
