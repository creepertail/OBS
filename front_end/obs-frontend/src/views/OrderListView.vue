<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from "vue-router"
import axios from 'axios'
import type Order from "../type/order"

const router = useRouter()
const orders = ref<Order[]>([])
const loading = ref(true)
const errorMsg = ref('')
const token = localStorage.getItem('accessToken')

const showReviewModal = ref(false)
const selectedBookID = ref<string | null>(null)

const hoverRating = ref<number>(0)
const rating = ref<number>(0)
const comment = ref('')

onMounted(async () => {
  try {
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
    console.log("res", res.data)

    orders.value = res.data
    console.log("orders", orders.value)
  } catch (e) {
    errorMsg.value = '取得訂單失敗'
    console.error(e)
  } finally {
    loading.value = false
  }
})

/* 狀態轉換 */
function orderStateText(state: number) {
  return ['商家未接單', '商家備貨中', '物流運送中', '商品已抵達', '顧客已取件'][state] ?? '未知'
}

function goToBookPage(bookID: string) {
  router.push({
    name: 'book',
    params: { bookID }
  })
}

/* 付款方式轉換 */
function paymentMethodText(method: number) {
  return ['貨到付款', '信用卡'][method] ?? '未知'
}

async function receiveGoods(order: Order) {
  try {
    await axios.patch(
      `http://localhost:3000/orders/${order.orderId}`,
      {
        state: 4
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    order.state = 4

  } catch (e) {
    alert("更改訂單狀態失敗失敗")
  }
}

function openReviewModal(bookID: string) {
  selectedBookID.value = bookID
  rating.value = 0
  comment.value = ''
  showReviewModal.value = true
}

function getStarClass(index: number) {
  const active = hoverRating.value
    ? index <= hoverRating.value
    : index <= rating.value

  return active ? 'pi-star-fill active' : 'pi-star'
}

function getTodayDate(): string | undefined{
  return new Date().toISOString().split('T')[0]
}

async function submitReviewAndReceive() {
  if (!selectedBookID.value) return

  try {
    const today = getTodayDate()

    axios.post(
      'http://localhost:3000/reviews',
      {
        bookID: selectedBookID.value,
        date: today,
        stars: rating.value,
        description: comment.value
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    // 更新前端狀態
    showReviewModal.value = false

  } catch (e) {
    alert('送出評論或更新訂單失敗')
    console.error(e)
  }
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
            <div class="order-merchant">
              訂單商家：{{ order.merchant.merchantName }}
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

        <!-- 商家 info -->
        <div class="order-merchant-info">
          <strong>商家地址：</strong>
          <p>{{ order.merchant.merchantAddress }}</p>
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

                  <button class="button" 
                    v-if="order.state === 4"
                    @click.stop
                    @click="openReviewModal(item.book.bookID)"
                  >評論</button>
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
            <span>{{ order.totalQuantity }}</span>
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

        <!-- 預留：操作按鈕 -->
        <div class="order-actions">
          <button class="button" 
            :disabled="order.state !== 3"
            @click="receiveGoods(order)"
          >{{(order.state !== 4) ? '領貨' : '已領貨'}}</button>
        </div>
      </article>
    </section>
  </main>

  <!-- 評論 Modal -->
  <div v-if="showReviewModal" class="modal-backdrop">
    <div class="modal">
      <h2 class="modal-title">完成領貨，留下評論</h2>

      <!-- 星級 -->
      <div class="form-group">
      <label>星級評分</label>

      <div class="rating-stars">
        <i
          v-for="i in 5"
          :key="i"
          class="pi"
          :class="getStarClass(i)"
          @mouseenter="hoverRating = i"
          @mouseleave="hoverRating = 0"
          @click="rating = i"
        ></i>
      </div>
    </div>


      <!-- 評論 -->
      <div class="form-group">
        <label>評論內容</label>
        <textarea
          v-model="comment"
          placeholder="請輸入您的評論"
        ></textarea>
      </div>

      <!-- 按鈕 -->
      <div class="modal-actions">
        <button class="button cancel" @click="showReviewModal = false">
          取消
        </button>
        <button class="button" @click="submitReviewAndReceive">
          送出
        </button>
      </div>
    </div>
  </div>

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

.order-merchant {
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
.order-merchant-info {
  margin-top: 16px;
}

.order-merchant-info p {
  font-size: 14px;
  color: var(--color-text-secondary);
}

/* 資訊 */
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

/* ===== Modal ===== */

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal {
  background: var(--color-bg-card);
  color: var(--color-text-primary);
  padding: 24px;
  border-radius: 16px;
  width: 400px;
  border: 1px solid var(--color-border);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
}

.form-group {
  margin-top: 16px;
}

.form-group label {
  font-weight: 600;
  color: var(--color-text-primary);
}

textarea {
  width: 100%;
  min-height: 80px;
  margin-top: 8px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-page);
  color: var(--color-text-primary);
  resize: vertical;
}

textarea::placeholder {
  color: var(--color-text-secondary);
}

.stars label {
  font-size: 22px;
  cursor: pointer;
  margin-right: 6px;
  color: var(--color-accent);
}

.stars input {
  display: none;
}

.button {
  background-color: var(--color-accent);
  color: var(--vt-c-white);
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background-color 0.25s ease, transform 0.1s ease;
}

.button:hover:not(:disabled) {
  background-color: var(--color-border-hover);
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 取消按鈕 */
.button.cancel {
  background-color: var(--color-bg-muted);
  color: var(--color-text-primary);
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
