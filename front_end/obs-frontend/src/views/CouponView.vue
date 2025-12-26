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

// 模態框狀態
const showModal = ref(false)
const modalLoading = ref(false)
const modalError = ref('')

// User: 領取優惠券表單
const claimForm = ref({
  redemptionCode: ''
})

// Merchant/Admin: 建立優惠券表單
const createForm = ref({
  quantity: 1,
  validDate: '',
  discount: 0.9,
  description: '',
  redemptionCode: ''
})

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

// 計算標題
const pageTitle = ref("優惠券");

// 打開新增優惠券模態框
function openAddModal() {
  showModal.value = true
  modalError.value = ''
  
  // 重置表單
  if (userType.value === 'user') {
    claimForm.value.redemptionCode = ''
  } else {
    createForm.value = {
      quantity: 1,
      validDate: '',
      discount: 0.9,
      description: '',
      redemptionCode: ''
    }
  }
}

// 關閉模態框
function closeModal() {
  showModal.value = false
  modalError.value = ''
}

// User: 領取優惠券
async function claimCoupon() {
  try {
    modalLoading.value = true
    modalError.value = ''

    const token = localStorage.getItem('accessToken')
    await axios.post(
      'http://localhost:3000/claims',
      {
        redemptionCode: claimForm.value.redemptionCode
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    // 重新載入數據
    const res = await axios.get<ClaimWithCoupon[]>(
      'http://localhost:3000/claims/mine',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    claims.value = res.data

    closeModal()
    alert('優惠券領取成功！')
  } catch (e: any) {
    if (e.response?.status === 409) {
      const errorMessage = e.response?.data?.message || ''
      if (errorMessage.includes('expired')) {
        modalError.value = '此優惠券已過期'
      } else if (errorMessage.includes('already claimed')) {
        modalError.value = '您已經擁有此優惠券了'
      } else {
        modalError.value = errorMessage || '領取優惠券失敗'
      }
    } else {
      modalError.value = e.response?.data?.message || '領取優惠券失敗'
    }
    console.error(e)
  } finally {
    modalLoading.value = false
  }
}

// Merchant/Admin: 建立優惠券
async function createCoupon() {
  try {
    modalLoading.value = true
    modalError.value = ''

    const token = localStorage.getItem('accessToken')
    const memberID = localStorage.getItem('memberID')

    // 格式化日期為後端期望的格式 (移除毫秒)
    const validDate = new Date(createForm.value.validDate).toISOString().replace(/\.\d{3}Z$/, 'Z')

    await axios.post(
      'http://localhost:3000/coupons',
      {
        quantity: createForm.value.quantity,
        validDate: validDate,
        discount: createForm.value.discount,
        description: createForm.value.description,
        redemptionCode: createForm.value.redemptionCode,
        memberID: memberID
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    // 重新載入數據
    const endpoint = userType.value === 'admin' 
      ? 'http://localhost:3000/coupons'
      : 'http://localhost:3000/coupons/mine'
    
    const res = await axios.get<Coupon[]>(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    coupons.value = res.data

    closeModal()
    alert('優惠券建立成功！')
  } catch (e: any) {
    if (e.response?.status === 409) {
      modalError.value = '此兌換碼已經被使用了'
    } else {
      modalError.value = e.response?.data?.message || '建立優惠券失敗'
    }
    console.error(e)
  } finally {
    modalLoading.value = false
  }
}

// 提交表單
function handleSubmit() {
  if (userType.value === 'user') {
    claimCoupon()
  } else {
    createCoupon()
  }
}
</script>

<template>
  <main class="coupon-page">
    <div class="coupon-title">
      <h1>{{ pageTitle }}</h1>
      <button class="add-button" @click="openAddModal">新增優惠券</button>
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

    <!-- 新增優惠券模態框 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ userType === 'user' ? '領取優惠券' : '建立優惠券' }}</h2>
          <button class="close-button" @click="closeModal">&times;</button>
        </div>

        <!-- User: 領取優惠券表單 -->
        <form v-if="userType === 'user'" @submit.prevent="handleSubmit" class="modal-form">
          <div class="form-group">
            <label for="redemptionCode">兌換碼</label>
            <input
              id="redemptionCode"
              type="text"
              v-model="claimForm.redemptionCode"
              placeholder="請輸入兌換碼"
              required
            />
          </div>

          <div v-if="modalError" class="modal-error">{{ modalError }}</div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="cancel-button">取消</button>
            <button type="submit" class="submit-button" :disabled="modalLoading">
              {{ modalLoading ? '處理中...' : '領取' }}
            </button>
          </div>
        </form>

        <!-- Merchant/Admin: 建立優惠券表單 -->
        <form v-else @submit.prevent="handleSubmit" class="modal-form">
          <div class="form-group">
            <label for="description">優惠券描述</label>
            <input
              id="description"
              type="text"
              v-model="createForm.description"
              placeholder="例如：年末折扣券"
              required
            />
          </div>

          <div class="form-group">
            <label for="redemptionCodeCreate">兌換碼</label>
            <input
              id="redemptionCodeCreate"
              type="text"
              v-model="createForm.redemptionCode"
              placeholder="例如：NEWYEAR-90"
              required
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="discount">折扣（0-1之間）</label>
              <input
                id="discount"
                type="number"
                step="0.01"
                min="0"
                max="1"
                v-model.number="createForm.discount"
                required
              />
            </div>

            <div class="form-group">
              <label for="quantity">數量</label>
              <input
                id="quantity"
                type="number"
                min="1"
                v-model.number="createForm.quantity"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="validDate">有效期限</label>
            <input
              id="validDate"
              type="date"
              v-model="createForm.validDate"
              required
            />
          </div>

          <div v-if="modalError" class="modal-error">{{ modalError }}</div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="cancel-button">取消</button>
            <button type="submit" class="submit-button" :disabled="modalLoading">
              {{ modalLoading ? '處理中...' : '建立' }}
            </button>
          </div>
        </form>
      </div>
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
  
  .coupon-title h1 {
    font-size: 24px;
  }
}

/* ===== Modal ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-button:hover {
  color: #333;
}

.modal-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #3498db;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.modal-error {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-button,
.submit-button {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-button {
  background: #f0f0f0;
  color: #666;
}

.cancel-button:hover {
  background: #e0e0e0;
}

.submit-button {
  background: #3498db;
  color: white;
}

.submit-button:hover:not(:disabled) {
  background: #2980b9;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>