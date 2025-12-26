<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import type Order from "../type/order"


const orders = ref<Order[]>([])
const loading = ref(true)
const errorMsg = ref('')

onMounted(async () => {
  try {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      errorMsg.value = '請先登入'
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

    orders.value = res.data
  } catch (e) {
    errorMsg.value = '取得訂單失敗'
    console.error(e)
  } finally {
    loading.value = false
  }
})

/* 狀態轉換 */
function orderStateText(state: number) {
  return ['待處理', '已付款', '已出貨', '已完成', '已取消'][state] ?? '未知'
}

/* 付款方式轉換 */
function paymentMethodText(method: number) {
  return ['貨到付款', '信用卡'][method] ?? '未知'
}
</script>

<template>
  <main class="order-page">
    <h1 class="order-title">我的訂單</h1>

    <!-- 載入中 -->
    <div v-if="loading" class="order-state">
      載入中…
    </div>

    <!-- 錯誤 -->
    <div v-else-if="errorMsg" class="order-state error">
      {{ errorMsg }}
    </div>

    <!-- 空訂單 -->
    <div v-else-if="orders.length === 0" class="order-state">
      尚無任何訂單
    </div>

    <!-- 訂單列表 -->
    <section v-else class="order-list">
      <article
        v-for="order in orders"
        :key="order.orderId"
        class="order-card"
      >
        <!-- 上方 -->
        <div class="order-card__header">
          <div>
            <div class="order-id">
              訂單編號：{{ order.orderId }}
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

        <!-- 商家 -->
        <div class="order-merchant">
          <strong>{{ order.merchant.merchantName }}</strong>
          <p>{{ order.merchant.merchantAddress }}</p>
        </div>

        <!-- 訂單資訊 -->
        <div class="order-info">
          <div>
            <span>付款方式</span>
            <span>{{ paymentMethodText(order.paymentMethod) }}</span>
          </div>
          <div>
            <span>商品數量</span>
            <span>{{ order.totalAmount }}</span>
          </div>
          <div>
            <span>寄送地址</span>
            <span>{{ order.shippingAddress }}</span>
          </div>
        </div>

        <!-- 金額 -->
        <div class="order-total">
          總金額 NT$ {{ order.totalPrice }}
        </div>
      </article>
    </section>
  </main>
</template>

<style scoped>
/* ===== Page ===== */
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

/* 狀態 */
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

.order-id {
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

/* 商家 */
.order-merchant {
  margin-top: 16px;
}

.order-merchant p {
  font-size: 14px;
  color: var(--color-text-secondary);
}

/* 資訊 */
.order-info {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  font-size: 14px;
}

.order-info div {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

/* 金額 */
.order-total {
  margin-top: 20px;
  text-align: right;
  font-size: 20px;
  font-weight: 800;
  color: var(--color-danger);
}
</style>
