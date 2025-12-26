<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

interface Coupon {
  couponID: string
  quantity: number
  validDate: string
  discount: number
  description: string
  redemptionCode: string
  memberID: string
  createdAt: string
  updatedAt: string
}

interface ClaimWithCoupon {
  claimID: string
  userID: string
  couponID: string
  claimedAt: string
  state: number
  usedAt: string | null
  coupon: Coupon
}

const userType = ref('')
const coupons = ref<Coupon[]>([])
const claims = ref<ClaimWithCoupon[]>([])
const loading = ref(true)
const errorMsg = ref('')

onMounted(async () => {
  try {
    const token = localStorage.getItem('accessToken')
    const type = localStorage.getItem('type')
    
    if (!token) {
      errorMsg.value = '請先登入'
      loading.value = false
      return
    }

    userType.value = type || ''

    // 根據用戶類型調用不同的API
    if (type === 'user') {
      // 取得user擁有的coupon
      const res = await axios.get<ClaimWithCoupon[]>(
        'http://localhost:3000/claims/mine',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      claims.value = res.data
    } else if (type === 'merchant') {
      // 取得merchant建立的coupon
      const res = await axios.get<Coupon[]>(
        'http://localhost:3000/coupons/mine',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      coupons.value = res.data
    } else if (type === 'admin') {
      // 取得所有的coupon
      const res = await axios.get<Coupon[]>(
        'http://localhost:3000/coupons',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      coupons.value = res.data
    }
  } catch (e: any) {
    errorMsg.value = e.response?.data?.message || '取得優惠券失敗'
    console.error(e)
  } finally {
    loading.value = false
  }
})

// 格式化日期
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('zh-TW')
}

// 格式化折扣
function formatDiscount(discount: number) {
  return `${Math.round(discount * 100)}%`
}

// Claim狀態文字
function claimStateText(state: number) {
  return ['未使用', '已使用'][state] ?? '未知'
}

const pageTitle = ref('優惠券');
</script>

<template>
  <main class="coupon-page">
    <div class="coupon-title">
      <h1>{{ pageTitle }}</h1>
      <button class="add-button">新增優惠券</button>
    </div>

    <!-- 載入中 -->
    <div v-if="loading" class="coupon-state">
      載入中…
    </div>

    <!-- 錯誤 -->
    <div v-else-if="errorMsg" class="coupon-state error">
      {{ errorMsg }}
    </div>

    <!-- User: 顯示claims -->
    <div v-else-if="userType === 'user'">
      <div v-if="claims.length === 0" class="coupon-state">
        尚無任何優惠券
      </div>

      <section v-else class="coupon-list">
        <article
          v-for="claim in claims"
          :key="claim.claimID"
          class="coupon-card"
          :class="{ used: claim.state === 1 }"
        >
          <div class="coupon-card__header">
            <div class="coupon-discount">
              {{ formatDiscount(claim.coupon.discount) }} OFF
            </div>
            <span class="coupon-status">
              {{ claimStateText(claim.state) }}
            </span>
          </div>

          <div class="coupon-description">
            {{ claim.coupon.description }}
          </div>

          <div class="coupon-code">
            兌換碼：<strong>{{ claim.coupon.redemptionCode }}</strong>
          </div>

          <div class="coupon-info">
            <div>
              <span>有效期限</span>
              <span>{{ formatDate(claim.coupon.validDate) }}</span>
            </div>
            <div>
              <span>領取時間</span>
              <span>{{ formatDate(claim.claimedAt) }}</span>
            </div>
            <div v-if="claim.usedAt">
              <span>使用時間</span>
              <span>{{ formatDate(claim.usedAt) }}</span>
            </div>
          </div>
        </article>
      </section>
    </div>

    <!-- Merchant & Admin: 顯示coupons -->
    <div v-else-if="userType === 'merchant' || userType === 'admin'">
      <div v-if="coupons.length === 0" class="coupon-state">
        尚無任何優惠券
      </div>

      <section v-else class="coupon-list">
        <article
          v-for="coupon in coupons"
          :key="coupon.couponID"
          class="coupon-card"
        >
          <div class="coupon-card__header">
            <div class="coupon-discount">
              {{ formatDiscount(coupon.discount) }} OFF
            </div>
            <span class="coupon-quantity">
              剩餘數量：{{ coupon.quantity }}
            </span>
          </div>

          <div class="coupon-description">
            {{ coupon.description }}
          </div>

          <div class="coupon-code">
            兌換碼：<strong>{{ coupon.redemptionCode }}</strong>
          </div>

          <div class="coupon-info">
            <div>
              <span>有效期限</span>
              <span>{{ formatDate(coupon.validDate) }}</span>
            </div>
            <div>
              <span>建立時間</span>
              <span>{{ formatDate(coupon.createdAt) }}</span>
            </div>
          </div>
        </article>
      </section>
    </div>
  </main>
</template>

<style scoped>
/* ===== Page ===== */
.coupon-page {
  min-height: 100vh;
  padding: 100px 24px 48px;
  background: var(--color-bg-page);
  color: var(--color-text-primary);
}

.coupon-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.coupon-title h1 {
  font-size: 32px;
  font-weight: 800;
}

.add-button {
  padding: 10px 20px;
  border: none;
  background: #3498db;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: 0.2s;
  white-space: nowrap;
}

.add-button:hover {
  background: #2980b9;
}

/* 狀態 */
.coupon-state {
  text-align: center;
  padding: 80px 0;
  color: var(--color-text-secondary);
}

.coupon-state.error {
  color: var(--color-danger);
}

/* ===== List ===== */
.coupon-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* ===== Card ===== */
.coupon-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 18px;
  padding: 24px;
  color: white;
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.3);
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative;
  overflow: hidden;
}

.coupon-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.coupon-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(102, 126, 234, 0.4);
}

.coupon-card.used {
  background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
  opacity: 0.7;
}

.coupon-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.coupon-discount {
  font-size: 32px;
  font-weight: 800;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.coupon-status,
.coupon-quantity {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.coupon-description {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  min-height: 48px;
}

.coupon-code {
  background: rgba(255, 255, 255, 0.15);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  border: 1px dashed rgba(255, 255, 255, 0.3);
}

.coupon-code strong {
  font-size: 16px;
  letter-spacing: 1px;
}

.coupon-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.coupon-info > div {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.coupon-info > div > span:first-child {
  opacity: 0.8;
}

.coupon-info > div > span:last-child {
  font-weight: 600;
}

/* 響應式 */
@media (max-width: 768px) {
  .coupon-list {
    grid-template-columns: 1fr;
  }
  
  .coupon-title {
    font-size: 24px;
  }
}
</style>