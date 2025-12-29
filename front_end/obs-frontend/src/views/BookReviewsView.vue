<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import axios from "axios"
import type { Review } from "../type/review"

const route = useRoute()
const router = useRouter()

const reviews = ref<Review[]>([])
const loading = ref(true)
const errorMsg = ref("")

const bookID = route.params.bookID as string

/* 平均星等 */
const averageStars = computed(() => {
  if (reviews.value.length === 0) return 0
  const total = reviews.value.reduce((sum, r) => sum + r.stars, 0)
  return (total / reviews.value.length).toFixed(1)
})

const starFillPercent = computed(() => {
  if (reviews.value.length === 0) return 0
  const total = reviews.value.reduce((sum, r) => sum + r.stars, 0)
  return Math.min(total / reviews.value.length / 5 * 100, 100)
})

onMounted(async () => {
  try {
    const res = await axios.get<Review[]>(
      `http://localhost:3000/reviews/book/${bookID}`
    )
    reviews.value = res.data ?? []
  } catch (e) {
    errorMsg.value = "無法載入評論"
  } finally {
    loading.value = false
  }
})

function goBack() {
  router.back()
}
</script>

<template>
  <main class="reviews-page">
    <div class="reviews-card">

      <!-- Header -->
      <div class="reviews-header">
        <button class="reviews-back" @click="goBack">
          ← 返回
        </button>

        <h1 class="reviews-title">所有評論</h1>
      </div>

      <!-- Summary -->
      <div v-if="reviews.length > 0" class="reviews-summary">
        <div
          v-if="reviews.length > 0"
          class="book-info__rating"
        >
          <div class="star-rating">
            <!-- 底層：空星 -->
            <div class="star-rating__base">
              <i v-for="i in 5" :key="i" class="pi pi-star" />
            </div>

            <!-- 上層：填滿星（用寬度裁切） -->
            <div
              class="star-rating__fill"
              :style="{ width: starFillPercent + '%' }"
            >
              <i v-for="i in 5" :key="i" class="pi pi-star-fill" />
            </div>
          </div>

          <div class="reviews-summary__info">
            <span class="reviews-summary__avg">
              {{ averageStars }}
            </span>

            <span class="reviews-summary__count">
              （{{ reviews.length }} 則評論）
            </span>
          </div>
        </div>

      </div>

      <!-- Loading -->
      <p v-if="loading" class="reviews-state">
        正在載入評論…
      </p>

      <!-- Error -->
      <p v-else-if="errorMsg" class="reviews-state reviews-state--error">
        {{ errorMsg }}
      </p>

      <!-- Empty -->
      <p v-else-if="reviews.length === 0" class="reviews-state">
        尚無評論
      </p>

      <!-- Reviews -->
      <div v-else class="reviews-list">
        <div
          v-for="review in reviews"
          :key="review.userID + review.date"
          class="review-item"
        >
          <div class="review-item__header">
            <span class="review-item__user">
              {{ review.user.userName }}
            </span>

            <span class="review-item__date">
              {{ review.date }}
            </span>
          </div>

          <div class="review-item__stars">
            <i
              v-for="n in 5"
              :key="n"
              class="pi"
              :class="n <= review.stars
                ? 'pi-star-fill'
                : 'pi-star'"
            />
          </div>

          
          <p class="review-item__content">
            {{ review.description }}
          </p>
        </div>
      </div>

    </div>
  </main>
</template>

<style scoped>
/* ===== Page ===== */
.reviews-page {
  min-height: 100vh;
  padding: 100px 16px 48px;
  background: var(--color-bg-page);
}

.reviews-card {
  max-width: 900px;
  margin: 0 auto;
  background: var(--color-bg-card);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.08);
}

/* ===== Header ===== */
.reviews-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.reviews-back {
  background: none;
  border: none;
  color: var(--color-accent);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.reviews-back:hover {
  text-decoration: underline;
}

.reviews-title {
  font-size: 28px;
  font-weight: 800;
}

/* ===== Summary ===== */
.reviews-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}

.reviews-summary__stars .pi-star-fill {
  color: #f59e0b;
}

.reviews-summary__stars .pi-star {
  color: #d1d5db;
}

.reviews-summary__avg {
  font-size: 20px;
  font-weight: 700;
}

.reviews-summary__count {
  color: var(--color-text-secondary);
  font-size: 14px;
}

/* ===== States ===== */
.reviews-state {
  text-align: center;
  color: var(--color-text-secondary);
}

.reviews-state--error {
  color: #dc2626;
}

/* ===== Review Item ===== */
.review-item {
  background: var(--color-bg-muted);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
}

.review-item__header {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 8px;
}

.review-item__user {
  font-weight: 700;
}

.review-item__date {
  color: var(--color-text-secondary);
}

.review-item__stars {
  margin-bottom: 12px;
}

.review-item__stars .pi-star-fill {
  color: #f59e0b;
}

.review-item__stars .pi-star {
  color: #d1d5db;
}

.review-item__content {
  font-size: 15px;
  line-height: 1.8;
  color: var(--color-text-primary);
}
.book-info__rating {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
  padding-bottom: 10px;
}

.star-rating {
  position: relative;
  display: inline-block;
  line-height: 1;
}

.star-rating__base,
.star-rating__fill {
  display: flex;
}

.star-rating__base i {
  color: #d1d5db; /* 灰色空星 */
  font-size: 14px;
}

.star-rating__fill {
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  white-space: nowrap;
}

.star-rating__fill i {
  color: #f59e0b; /* 金色實星 */
  font-size: 14px;
}
</style>
