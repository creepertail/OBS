<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from "vue-router"
import axios from 'axios'

interface RawCartItem {
  bookID: string
  name: string
  amount: number
  inventoryQuantity: number
  price: number
  images: { 
    imageId: string
    imageUrl: string
    displayOrder: number
    isCover: boolean
  }[]
  author: string
  publisher: string
}

interface CartItem {
  bookID: string
  name: string
  amount: number
  inventoryQuantity: number
  price: number
  imageUrl: string
  author: string
  publisher: string
}

const cartItems = ref<CartItem[]>([])
const router = useRouter()

onMounted(async () => {
  try {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      alert('請先登入帳號')
      return
    }

    const res = await axios.get<RawCartItem[]>(
      'http://localhost:3000/cart',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    console.log(res)
    cartItems.value = res.data.map((cartItems: RawCartItem) => ({
    bookID: cartItems.bookID,
    name: cartItems.name,
    amount: cartItems.amount,
    inventoryQuantity: cartItems.inventoryQuantity,
    price: cartItems.price,
    imageUrl: cartItems.images?.find(img => img.isCover)?.imageUrl 
       ?? "http://localhost:3000/uploads/defaultImages/default_book_image.png",
    author: cartItems.author,
    publisher: cartItems.publisher,
  }))
  } catch (e) {
    console.error('取得購物車資料失敗', e)
  }
})

const totalAmount = computed(() =>
  cartItems.value.reduce(
    (sum, item) => sum + item.price * item.amount,
    0
  )
)

function goToBookPage(index: number) {
  const item = cartItems.value[index]
  router.push({
  name: 'book',
  params: {
    bookID: item?.bookID
  }
})
}

async function removeItem(index: number) {
  const item = cartItems.value[index]

  try {
    await axios.delete(
      `http://localhost:3000/cart/${item?.bookID}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    )
  } catch (e) {
    console.error('刪除購物車資料失敗', e)
  } finally{
    cartItems.value.splice(index, 1)
  }
}

async function updateAmount(index: number, value: number) {
  const item = cartItems.value[index]
  if (!item) return

  item.amount = Math.max(1, Math.min(value, item.inventoryQuantity))

  try{
    await axios.patch(
      `http://localhost:3000/cart/${item.bookID}`,
      {
        amount: item.amount
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          "Content-Type": "application/json"
        }
      }
    )
  } catch (e) {
    console.error('更新購物車資料失敗', e)
  }
}

async function deleteAllCartItem(){
  try {
    await axios.delete(
      'http://localhost:3000/cart',
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    )
  } catch (e) {
    console.error('刪除購物車資料失敗', e)
  } finally{
    cartItems.value = []
  }
}
</script>

<template>
  <main class="cart-page">
    <h1 class="cart-title">購物車</h1>

    <div v-if="cartItems.length === 0" class="cart-empty">
      購物車是空的
    </div>

    <div v-else class="cart-layout">
      <!-- 左側：商品列表 -->
      <section class="cart-list">
        <div
          v-for="(item, index) in cartItems"
          :key="item.bookID"
          class="cart-item"
        >
          <img
            :src="item.imageUrl"
            alt="book cover"
            class="cart-item__image"
            v-on:click="goToBookPage(index)"
          />

          <div class="cart-item__content">
            <div>
              <h2 class="cart-item__title">{{ item.name }}</h2>
              <p class="cart-item__meta">
                {{ item.author }}｜{{ item.publisher }}
              </p>
              <p class="cart-item__price">
                NT$ {{ item.price }}
              </p>
            </div>

            <div class="cart-item__footer">
              <div class="cart-item__amount">
                <span>數量</span>
                <div class="quantity-control">
                  <button
                    class="quantity-control__btn"
                    :disabled="item.amount <= 1"
                    @click="updateAmount(index, item.amount - 1)"
                  >
                    −
                  </button>
              
                  <span class="quantity-control__number">{{ item.amount }}</span>
              
                  <button
                    class="quantity-control__btn"
                    :disabled="item.amount >= item.inventoryQuantity"
                    @click="updateAmount(index, item.amount + 1)"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                class="cart-item__remove"
                @click="removeItem(index)"
              >
                移除
              </button>
            </div>

            <div class="cart-item__subtotal">
              小計：
              <strong>
                NT$ {{ item.price * item.amount }}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <!-- 右側：總計 -->
      <aside class="cart-summary">
        <h2>訂單總計</h2>

        <div class="cart-summary__row">
          <span>商品總額</span>
          <span>NT$ {{ totalAmount }}</span>
        </div>

        <hr />

        <div class="cart-summary__total">
          <span>應付金額</span>
          <span>NT$ {{ totalAmount }}</span>
        </div>

        <button class="btn btn-primary">
          前往結帳
        </button>

        <button
          class="btn btn-secondary"
          @click="deleteAllCartItem"
        >
          清空購物車
        </button>
      </aside>
    </div>
  </main>
</template>

<style scoped>
/* ===== Page ===== */
.cart-page {
  min-height: 100vh;
  padding: 100px 24px 48px;
  background-color: var(--color-bg-page);
  color: var(--color-text-primary);
}

.cart-title {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 32px;
}

/* Empty State */
.cart-empty {
  text-align: center;
  color: var(--color-text-secondary);
  padding: 80px 0;
  font-size: 18px;
}

/* Layout */

.cart-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 32px;
}

@media (max-width: 1024px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }
}

/* Cart List */

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

.cart-item__amount {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quantity-control {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
  background: var(--color-bg-muted);
}

.quantity-control__btn {
  width: 32px;
  height: 32px;
  font-size: 20px;
  font-weight: 600;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--color-text-primary);
  transition: background-color 0.15s ease;
}

.quantity-control__btn:hover:not(:disabled) {
  background: var(--color-background-soft);
}

.quantity-control__btn:disabled {
  color: var(--color-text-secondary);
  cursor: not-allowed;
}

.quantity-control__number {
  width: 40px;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
}


/* 移除 number input 箭頭 */
.cart-item__amount input::-webkit-inner-spin-button,
.cart-item__amount input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.cart-item__remove {
  background: none;
  border: none;
  color: var(--color-danger);
  cursor: pointer;
  font-size: 14px;
}

.cart-item__remove:hover {
  text-decoration: underline;
}

.cart-item__subtotal {
  text-align: right;
  margin-top: 8px;
  color: var(--color-text-secondary);
}

/* ===============================
   Summary
   =============================== */

.cart-summary {
  background: var(--color-bg-card);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid var(--color-border);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
  position: sticky;
  top: 100px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-summary h2 {
  font-size: 22px;
  font-weight: 700;
}

.cart-summary__row {
  display: flex;
  justify-content: space-between;
  color: var(--color-text-secondary);
}

.cart-summary hr {
  border: none;
  border-top: 1px solid var(--color-border);
}

.cart-summary__total {
  display: flex;
  justify-content: space-between;
  font-size: 20px;
  font-weight: 800;
  color: var(--color-danger);
}

/* ===============================
   Buttons
   =============================== */

.btn {
  width: 100%;
  padding: 14px 0;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s ease, transform 0.15s ease;
}

.btn-primary {
  background: var(--color-danger);
  color: #ffffff;
}

.btn-primary:hover {
  background: var(--color-danger-hover);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--color-bg-muted);
  color: var(--color-text-primary);
}

.btn-secondary:hover {
  background: var(--color-border);
}
</style>
