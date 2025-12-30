<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from "vue-router"
import axios from 'axios'
import type Order from '../type/order'

const router = useRouter()
const orders = ref<Order[]>([])
const loading = ref(true)
const errorMsg = ref('')
const token = localStorage.getItem('accessToken')

onMounted(async () => {
  try {
    
    if (!token) {
      errorMsg.value = '請先登入商家帳號'
      return
    }

    const res = await axios.get<Order[]>(
      'http://localhost:3000/orders',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    console.log("res", res.data)

    orders.value = res.data
  } catch (e) {
    errorMsg.value = '取得商家訂單失敗'
    console.error(e)
  } finally {
    loading.value = false
  }
})

/* 訂單狀態文字 */
function orderStateText(state: number) {
  return ['未接單', '備貨中', '物流運送中', '已抵達', '已取件'][state] ?? '未知'
}

/* 付款方式文字 */
function paymentMethodText(method: number) {
  return ['貨到付款', '信用卡'][method] ?? '未知'
}

async function takeOrders(order: Order) {
  try {
    await axios.patch(
      `http://localhost:3000/orders/${order.orderId}`,
      {
        state: 1
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    order.state = 1
  } catch (e) {
    alert("更改訂單狀態失敗失敗")
  }
}

async function ship(order: Order) {
  try {
    await axios.patch(
      `http://localhost:3000/orders/${order.orderId}`,
      {
        state: 2
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    order.state = 2
  } catch (e) {
    alert("更改訂單狀態失敗失敗")
  }
}

async function deliveredGoods(order: Order) {
  try {
    await axios.patch(
      `http://localhost:3000/orders/${order.orderId}`,
      {
        state: 3
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    order.state = 3
  } catch (e) {
    alert("更改訂單狀態失敗失敗")
  }
}

function goToBookPage(bookID: string) {
  router.push({
    name: 'book',
    params: { bookID }
  })
}
</script>

<template>
  <main class="order-page">
    <h1 class="order-title">商家訂單管理</h1>

    <!-- 載入中 -->
    <div v-if="loading" class="order-state">
      載入中…
    </div>

    <!-- 錯誤 -->
    <div v-else-if="errorMsg" class="order-state error">
      {{ errorMsg }}
    </div>

    <!-- 無訂單 -->
    <div v-else-if="orders.length === 0" class="order-state">
      目前尚無任何訂單
    </div>

    <!-- 訂單列表 -->
    <section v-else class="order-list">
      <article
        v-for="order in orders"
        :key="order.orderId"
        class="order-card"
      >
        <!-- Header -->
        <div class="order-card__header">
          <div>
            <div class="order-customer">
              顧客名稱：{{ order.user.userName ?? '未知顧客' }}
            </div>
            <div class="order-date">
              下單時間：{{ new Date(order.orderDate).toLocaleString() }}
            </div>
          </div>

          <span class="order-status">
            {{ orderStateText(order.state) }}
          </span>
        </div>

        <hr />

        <!-- 顧客資訊 -->
        <div class="order-customer-info">
          <strong>配送地址：</strong>
          <p>{{ order.shippingAddress }}</p>
        </div>

        <!-- 訂單資訊 -->
        <div class="order-info">
          <!-- 書本清單 -->
          <section class="cart-list">
            <div
              v-for="item in order.contains"
              :key="item.book.bookID"
              class="cart-item"
              @click="goToBookPage(item.book.bookID)"
            >
              <img
                :src="
                  item.book.images.find(img => img.isCover)?.imageUrl
                  ?? 'http://localhost:3000/uploads/defaultImages/default_book_image.png'
                "
                class="cart-item__image"
              />
              <div class="cart-item__content">
                <div>
                  <h2 class="cart-item__title">{{ item.book.name }}</h2>
                  
                  <p class="cart-item__price">
                    NT$ {{ item.book.price }}
                  </p>
                </div>

                <div class="cart-item__footer">
                  <div class="cart-item__quantity">
                    <span>數量</span>
                    <div class="quantity-control">
                      <span class="quantity-control__number">
                        {{ item.quantity }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div>
            <span>付款方式</span>
            <span>{{ paymentMethodText(order.paymentMethod) }}</span>
          </div>
          <div>
            <span>商品數量</span>
            <span>{{ order.totalAmount }}</span>
          </div>
        </div>

        <!-- 金額 -->
        <div class="order-total">
          訂單金額 NT$ {{ order.totalPrice }}
        </div>

        <!-- 預留：操作按鈕 -->
        
        <div class="order-actions">
          <button class="button" 
            :disabled="order.state !== 0"
            @click="takeOrders(order)"
          >接單</button>
          <button class="button" 
            :disabled="order.state !== 1"
            @click="ship(order)"
          >出貨</button>
          <button class="button" 
            :disabled="order.state !== 2"
            @click="deliveredGoods(order)"
          >送達貨品</button>
        </div>
       
      </article>
    </section>
  </main>
</template>

<style scoped>
.order-page {
  min-height: 100vh;
  padding: 100px 24px 48px;
  background: var(--color-bg-page);
  color: var(--color-text-primary);
}

.order-title {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 32px;
}

.order-state {
  text-align: center;
  padding: 80px 0;
  color: var(--color-text-secondary);
}

.order-state.error {
  color: var(--color-danger);
}

/* ===== List ===== */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 80%;
  margin: 16px auto 0;
}

/* ===== Card ===== */
.order-card {
  background: var(--color-bg-card);
  border-radius: 18px;
  padding: 24px;
  border: 1px solid var(--color-border);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
}

.order-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.order-customer {
  font-weight: 600;
}

.order-date {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.order-status {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  background: var(--color-bg-muted);
}

/* 顧客 */
.order-customer-info {
  margin-top: 16px;
}

.order-customer-info p {
  font-size: 14px;
  color: var(--color-text-secondary);
}

/* 訂單資訊 */
.order-info {
  margin-top: 16px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  font-size: 14px;
}

.order-info div {
  display: flex;
  justify-content: space-between;
}

/* 金額 */
.order-total {
  margin-top: 20px;
  text-align: right;
  font-size: 20px;
  font-weight: 800;
  color: var(--color-danger);
}

.button {
  background-color: #667eea;
  color: #ffffff;
  padding: 12px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  margin: 4px 4px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.1s;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cart-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cart-item {
  display: flex;
  gap: 20px;
  background: var(--color-bg-card);
  padding: 20px;
  border-radius: 16px;
  border: 1px solid var(--color-border);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s ease;
}

.cart-item:hover {
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
}

.cart-item__image {
  max-width: 128px;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-muted);
}

.cart-item__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.cart-item__title {
  font-size: 18px;
  font-weight: 600;
}

.cart-item__meta {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.cart-item__price {
  color: var(--color-danger);
  font-weight: 700;
  margin-top: 8px;
}

.cart-item__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.cart-item__quantity {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
