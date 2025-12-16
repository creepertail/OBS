<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { useRoute } from "vue-router"
import axios from "axios"
import type { Book } from "../type/book"

const route = useRoute()
const book = ref<Book | null>(null)
const loading = ref(true)
const errorMsg = ref("")
const quantity = ref(1)

onMounted(async () => {
  try {
    const bookID = route.params.bookID as string
    const res = await axios.get<Book>(
      `http://localhost:3000/books/${bookID}`
    )

    const data = res.data

    // 確保 images 一定是陣列
    if (!Array.isArray(data.images)) {
      data.images = []
    }

    // 檢查是否已經有封面
    const hasCover = data.images.some(img => img.isCover)

    // 如果沒有封面 → 補預設圖
    if (!hasCover) {
      data.images.unshift({
        imageId: "imageId",
        imageUrl: "http://localhost:3000/uploads/defaultImages/default_book_image.png",
        displayOrder: 0,
        isCover: true
      })
    }

    book.value = data
    quantity.value = Math.min(1, data.inventoryQuantity || 1)

    console.log("處理後 images =", book.value.images)
  } catch (e) {
    errorMsg.value = "無法載入書籍資料"
  } finally {
    loading.value = false
  }
})

function addToCart() {
  if (!book.value) return

  addBookToCart(false);
}

function buyNow() {
  if (!book.value) return

  addBookToCart(true);

  
}

async function addBookToCart(goToCardPage: boolean) {
  try {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      alert("請先登入")
      return
    }

    await axios.post(
      "http://localhost:3000/cart",
      {
        bookID: book.value?.bookID,
        amount: quantity.value
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    )

    alert("已加入購物車！")
  } catch (error) {
    console.error(error)
    alert("加入購物車失敗")
  }
  if (goToCardPage){
    alert("前往購物車頁面")
  }
}

</script>

<template>
  <main class="book-page">

    <!-- 載入中 -->
    <div v-if="loading" class="page-state page-state--loading">
      正在載入書籍資料…
    </div>

    <!-- 錯誤 -->
    <div v-else-if="errorMsg" class="page-state page-state--error">
      {{ errorMsg }}
    </div>

    <!-- 書籍內容 -->
    <section v-else-if="book" class="book-detail">

      <!-- 上半部 -->
      <div class="book-detail__top">

        <!-- 書封 -->
        <div class="book-cover">
          <img
            :src="book.images.find(i => i.isCover)?.imageUrl || '/default-book.png'"
            alt="book cover"
            class="book-cover__image"
          />
        </div>

        <!-- 書籍資訊 -->
        <div class="book-info">
          <h1 class="book-info__title">{{ book.name }}</h1>

          <div class="book-info__meta">
            <p><span>作者</span>{{ book.author }}</p>
            <p><span>出版社</span>{{ book.publisher }}</p>
            <p><span>ISBN</span>{{ book.ISBN }}</p>
          </div>

          <div class="book-info__pricing">
            <div class="book-info__price">NT$ {{ book.price }}</div>
            <div
              class="book-info__stock"
              :class="book.inventoryQuantity > 0
                ? 'book-info__stock--available'
                : 'book-info__stock--soldout'"
            >
              {{ book.inventoryQuantity > 0
                ? `庫存 ${book.inventoryQuantity}`
                : '已售完' }}
            </div>
          </div>

          <!-- 數量選擇 -->
          <div class="book-quantity">
            <span class="book-quantity__label">數量</span>

            <div class="quantity-control">
              <button
                class="quantity-control__btn"
                @click="quantity--"
                :disabled="quantity <= 1"
              >
                −
              </button>

              <input
                class="quantity-control__input"
                type="number"
                v-model.number="quantity"
                :min="1"
                :max="book.inventoryQuantity"
              />

              <button
                class="quantity-control__btn"
                @click="quantity++"
                :disabled="quantity >= book.inventoryQuantity"
              >
                +
              </button>
            </div>
          </div>

          <div class="book-info__actions">
            <button
              class="action-button action-button--cart"
              :disabled="book.inventoryQuantity === 0"
              @click="addToCart"
            >
              加入購物車
            </button>

            <button
              class="action-button action-button--buy"
              :disabled="book.inventoryQuantity === 0"
              @click="buyNow"
            >
              立即購買
            </button>
          </div>
        </div>
      </div>

      <!-- 分隔線 -->
      <hr class="book-detail__divider" />

      <!-- 商品描述 -->
      <div class="book-description">
        <h2 class="book-description__title">內容介紹</h2>
        <p class="book-description__content">
          {{ book.productDescription }}
        </p>
      </div>

    </section>
  </main>
</template>


<style scoped>
/* ===== Page ===== */
.book-page {
  min-height: 100vh;
  background-color: var(--color-bg-page);
  padding: 100px 16px 48px;
}

/* ===== 狀態頁 ===== */
.page-state {
  text-align: center;
  padding: 80px 0;
  font-size: 18px;
}

.page-state--loading {
  color: var(--color-text-secondary);
}

.page-state--error {
  color: #dc2626; /* 錯誤色保留語意紅 */
}

/* ===== 主內容 ===== */
.book-detail {
  max-width: 1100px;
  margin: 0 auto;
  background: var(--color-bg-card);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.08);
  color: var(--color-text-primary);
}

/* ===== 上半部 ===== */
.book-detail__top {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 48px;
}

@media (max-width: 1024px) {
  .book-detail__top {
    grid-template-columns: 1fr;
  }
}

/* ===== 書封 ===== */
.book-cover {
  background: var(--color-bg-muted);
  border-radius: 20px;
  padding: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.book-cover__image {
  max-height: 420px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 12px 20px rgba(0, 0, 0, 0.15));
}

/* ===== 書籍資訊 ===== */
.book-info {
  display: flex;
  flex-direction: column;
}

.book-info__title {
  font-size: 34px;
  font-weight: 800;
  color: var(--color-text-primary);
  margin-bottom: 24px;
}

.book-info__meta p {
  font-size: 16px;
  color: var(--color-text-secondary);
  line-height: 1.7;
}

.book-info__meta span {
  display: inline-block;
  width: 70px;
  font-weight: 600;
  color: var(--color-text-primary);
}

/* ===== 價格與庫存 ===== */
.book-info__pricing {
  margin-top: 32px;
}

.book-info__price {
  font-size: 38px;
  font-weight: 800;
  color: #dc2626; /* 價格紅色：刻意不進主題變數 */
}

.book-info__stock {
  margin-top: 8px;
  font-size: 14px;
}

.book-info__stock--available {
  color: #16a34a;
}

.book-info__stock--soldout {
  color: #dc2626;
}

/* ===== 數量選擇 ===== */
.book-quantity {
  margin-top: 24px;
  padding-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.book-quantity__label {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.quantity-control {
  display: flex;
  align-items: center;
  background: var(--color-bg-muted);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.quantity-control__btn {
  width: 40px;
  height: 40px;
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

/* 移除 Chrome / Edge / Safari 的數字輸入上下箭頭 */
.quantity-control__input::-webkit-inner-spin-button,
.quantity-control__input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.quantity-control__input {
  width: 56px;
  height: 40px;
  text-align: center;
  border: none;
  outline: none;
  font-size: 16px;
  background: transparent;
  color: var(--color-text-primary);
  /* -moz-appearance: textfield; 移除 Firefox 的數字輸入箭頭 */
}


/* ===== 按鈕 ===== */
.book-info__actions {
  display: flex;
  gap: 16px;
  margin-top: auto;
}

.action-button {
  flex: 1;
  padding: 16px 0;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: transform 0.15s ease, background-color 0.2s ease;
}

.action-button:disabled {
  background: var(--color-bg-muted);
  color: var(--color-text-secondary);
  cursor: not-allowed;
}

/* 加入購物車 */
.action-button--cart {
  background: #f59e0b;
  color: #ffffff;
}

.action-button--cart:hover:not(:disabled) {
  background: #d97706;
  transform: translateY(-1px);
}

/* 立即購買 */
.action-button--buy {
  background: #dc2626;
  color: #ffffff;
}

.action-button--buy:hover:not(:disabled) {
  background: #b91c1c;
  transform: translateY(-1px);
}

/* ===== 分隔線 ===== */
.book-detail__divider {
  margin: 56px 0;
  border: none;
  border-top: 1px solid var(--color-border);
}

/* ===== 商品描述 ===== */
.book-description__title {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--color-text-primary);
}

.book-description__content {
  font-size: 16px;
  line-height: 1.9;
  color: var(--color-text-secondary);
  white-space: pre-line;
}

</style>
