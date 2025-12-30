<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import type Coupon from '../type/coupon'

const router = useRouter()
const coupons = ref<Coupon[]>([])
const loading = ref(true)
const errorMsg = ref('')
const selectedDiscountType = ref<string>('all')
const claimingCouponId = ref<string | null>(null)

onMounted(async () => {
  await fetchAvailableCoupons()
})

// 取得所有可領取的優惠券
async function fetchAvailableCoupons() {
  try {
    loading.value = true
    errorMsg.value = ''
    
    const token = localStorage.getItem('accessToken')
    if (!token) {
      errorMsg.value = '請先登入'
      loading.value = false
      return 
    }

    // 構建API URL
    let url = 'http://localhost:3000/coupons/available'
    if (selectedDiscountType.value !== 'all') {
      url += `?discountType=${selectedDiscountType.value}`
    }

    const res = await axios.get<Coupon[]>(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    coupons.value = res.data
  } catch (e: any) {
    errorMsg.value = e.response?.data?.message || '取得可領取優惠券失敗'
    console.error(e)
  } finally {
    loading.value = false
  }
}

// 領取優惠券
async function claimCoupon(coupon: Coupon) {
  try {
    claimingCouponId.value = coupon.couponID
    const token = localStorage.getItem('accessToken')
    
    if (!token) {
      alert('請先登入')
      return
    }

    await axios.post(
      'http://localhost:3000/claims',
      {
        redemptionCode: coupon.redemptionCode
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    alert('領取成功！')
    // 重新載入可領取的優惠券列表
    await fetchAvailableCoupons()
  } catch (e: any) {
    const message = e.response?.data?.message || '領取失敗'
    alert(message)
    console.error(e)
  } finally {
    claimingCouponId.value = null
  }
}

// 篩選條件改變時重新取得資料
async function onFilterChange() {
  await fetchAvailableCoupons()
}

// 格式化日期
function formatDate(dateString: string) {
  if (!dateString) return '無期限'
  return new Date(dateString).toLocaleDateString('zh-TW')
}

// 格式化折扣
function formatDiscount(discount: number) {
  if (discount > 1) {
    // 貨運折扣：固定金額
    return `折 $${discount} 元`
  } else {
    // 季節性或商家折扣：百分比
    return `${Math.round((1 - discount) * 100)} % OFF`
  }
}

// 格式化折扣類型
function formatDiscountType(discountType: number) {
  const types = ['商家折扣', '季節性折扣', '貨運折扣']
  return types[discountType] || '未知類型'
}

// 判斷優惠券是否已過期
function isExpired(validDate: string) {
  if (!validDate) return false
  return new Date(validDate) < new Date()
}

// 返回上一頁
function goBack() {
  router.back()
}
</script>

<template>
  <div class="claim-coupon-page">
    <div class="header">
      <button @click="goBack" class="back-btn">← 返回</button>
      <h1>可領取的優惠券</h1>
    </div>

    <!-- 篩選器 -->
    <div class="filter-section">
      <label for="discountType">篩選類型：</label>
      <select 
        id="discountType" 
        v-model="selectedDiscountType" 
        @change="onFilterChange"
        class="filter-select"
      >
        <option value="all">全部</option>
        <option value="0">商家折扣</option>
        <option value="1">季節性折扣</option>
        <option value="2">貨運折扣</option>
      </select>
    </div>

    <!-- 載入中 -->
    <div v-if="loading" class="loading">載入中...</div>

    <!-- 錯誤訊息 -->
    <div v-else-if="errorMsg" class="error">{{ errorMsg }}</div>

    <!-- 優惠券列表 -->
    <div v-else-if="coupons.length > 0" class="coupons-grid">
      <div 
        v-for="coupon in coupons" 
        :key="coupon.couponID" 
        class="coupon-card"
        :class="{ expired: isExpired(coupon.validDate) }"
      >
        <div class="coupon-header">
          <span class="discount-badge">
            {{ formatDiscount(coupon.discount, coupon.discountType) }}
          </span>
          <span class="type-badge">{{ formatDiscountType(coupon.discountType) }}</span>
        </div>

        <div class="coupon-body">
          <h3 class="coupon-description">{{ coupon.description }}</h3>
          
          <div class="coupon-info">
            <div class="info-row">
              <span class="label">兌換碼：</span>
              <span class="value code">{{ coupon.redemptionCode }}</span>
            </div>
            <div class="info-row">
              <span class="label">剩餘數量：</span>
              <span class="value">{{ coupon.quantity }}</span>
            </div>
            <div class="info-row">
              <span class="label">有效期限：</span>
              <span class="value">{{ formatDate(coupon.validDate) }}</span>
            </div>
          </div>
        </div>

        <div class="coupon-footer">
          <button 
            @click="claimCoupon(coupon)"
            class="claim-btn"
            :disabled="claimingCouponId === coupon.couponID || isExpired(coupon.validDate) || coupon.quantity <= 0"
          >
            <span v-if="claimingCouponId === coupon.couponID">領取中...</span>
            <span v-else-if="isExpired(coupon.validDate)">已過期</span>
            <span v-else-if="coupon.quantity <= 0">已領完</span>
            <span v-else>立即領取</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 無優惠券 -->
    <div v-else class="no-coupons">
      <p>目前沒有可領取的優惠券</p>
    </div>
  </div>
</template>

<style scoped>
.claim-coupon-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.back-btn {
  padding: 8px 16px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background-color: #e0e0e0;
}

h1 {
  margin: 0;
  font-size: 28px;
  color: #333;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.filter-section label {
  font-weight: 500;
  color: #555;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  background-color: white;
}

.filter-select:focus {
  outline: none;
  border-color: #007bff;
}

.loading,
.error,
.no-coupons {
  text-align: center;
  padding: 40px;
  font-size: 18px;
}

.error {
  color: #dc3545;
}

.no-coupons {
  color: #6c757d;
}

.coupons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.coupon-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.coupon-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.coupon-card.expired {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
  opacity: 0.7;
}

.coupon-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.discount-badge {
  font-size: 24px;
  font-weight: bold;
  background-color: rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 20px;
}

.type-badge {
  font-size: 12px;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
}

.coupon-body {
  margin-bottom: 20px;
}

.coupon-description {
  font-size: 18px;
  margin: 0 0 15px 0;
  font-weight: 500;
}

.coupon-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.label {
  opacity: 0.9;
}

.value {
  font-weight: 500;
}

.value.code {
  font-family: 'Courier New', monospace;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 4px;
}

.coupon-footer {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
}

.claim-btn {
  width: 100%;
  padding: 12px;
  background-color: white;
  color: #667eea;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.claim-btn:hover:not(:disabled) {
  background-color: #f0f0f0;
  transform: scale(1.02);
}

.claim-btn:disabled {
  background-color: rgba(255, 255, 255, 0.5);
  color: rgba(102, 126, 234, 0.6);
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .coupons-grid {
    grid-template-columns: 1fr;
  }

  h1 {
    font-size: 24px;
  }
}
</style>
