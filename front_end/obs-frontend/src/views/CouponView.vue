<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import type Coupon from '../type/coupon'
import type ClaimWithCoupon from '../type/claimWithCoupon'

const router = useRouter()

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
  redemptionCode: '',
  discountType: 0
})
const isDiscountPersent = ref(true)

// 監聽 discountType 變化，自動調整 discount 預設值
function onDiscountTypeChange() {
  if (createForm.value.discountType === 2) {
    // 貨運折扣：預設值改為固定金額
    createForm.value.discount = 50
  } else {
    // 季節性或商家折扣：預設值為百分比
    createForm.value.discount = 0.9
  }
}

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
      redemptionCode: '',
      discountType: userType.value === 'merchant' ? 0 : 1
    }
  }
}

// 前往查看所有可領取優惠券頁面
function goToClaimCouponView() {
  router.push({ name: 'claimCoupon' })
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
        memberID: memberID,
        discountType: createForm.value.discountType
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

// Merchant/Admin: 刪除優惠券
async function deleteCoupon(couponID: string) {
  if (!confirm('確定要刪除此優惠券嗎？此操作無法復原。')) {
    return
  }

  try {
    const token = localStorage.getItem('accessToken')
    await axios.delete(
      `http://localhost:3000/coupons/${couponID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    // 從列表中移除已刪除的優惠券
    coupons.value = coupons.value.filter(c => c.couponID !== couponID)
    alert('優惠券已成功刪除！')
  } catch (e: any) {
    alert(e.response?.data?.message || '刪除優惠券失敗')
    console.error(e)
  }
}
</script>

<template>
  <main class="coupon-page">
    <div class="coupon-title">
      <h1>{{ pageTitle }}</h1>
      <div class="button-group">
        <button v-if="userType === 'user'" class="view-available-button" @click="goToClaimCouponView">
          查看可領取優惠券
        </button>
        <button class="add-button" @click="openAddModal">新增優惠券</button>
      </div>
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
          :key="claim.userID + '-' + claim.couponID"
          class="coupon-card"
          :class="{ used: claim.state === 1 }"
        >
          <div class="coupon-card__header">
            <div class="coupon-discount">
              {{ formatDiscount(claim.coupon.discount) }}
            </div>
            <span class="coupon-status">
              {{ claimStateText(claim.state) }}
            </span>
          </div>

          <div class="coupon-type-tag">
            {{ formatDiscountType(claim.coupon.discountType) }}
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
              {{ formatDiscount(coupon.discount) }}
            </div>
            <span class="coupon-quantity">
              剩餘數量：{{ coupon.quantity }}
            </span>
          </div>

          <div class="coupon-type-tag">
            {{ formatDiscountType(coupon.discountType) }}
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

          <button class="delete-coupon-button" @click="deleteCoupon(coupon.couponID)">
            刪除優惠券
          </button>
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
            <label for="discountType">折扣類型</label>
            <select
              id="discountType"
              v-model.number="createForm.discountType"
              @change="onDiscountTypeChange"
              required
            >
              <option v-if="userType === 'merchant'" :value="0">商家折扣</option>
              <option v-if="userType === 'admin'" :value="1">季節性折扣</option>
              <option v-if="userType === 'admin'" :value="2">貨運折扣</option>
            </select>
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
              <label for="discount">
                {{ createForm.discountType === 2 ? '折扣金額（1-60）' : (!isDiscountPersent) ? '折扣（1-500之間）' : '折扣（0-1之間）' }}
              </label>
              <input
                id="discount"
                type="number"
                :step="createForm.discountType === 2 ? '1' : '0.01'"
                :min="createForm.discountType === 2 || !isDiscountPersent ? '1' : '0'"
                :max="createForm.discountType === 2 ? '60' : !isDiscountPersent ? '500' : '1'"
                v-model.number="createForm.discount"
                :placeholder="createForm.discountType === 2 ? '例如：50' : '例如：0.9'"
                required
              />
              <button class="button" 
                v-if="createForm.discountType !== 2"
                @click="isDiscountPersent = !isDiscountPersent;
                  createForm.discount = (isDiscountPersent) ? 0.9 : 100
                "
              >{{isDiscountPersent ? '打 X 折' : '折扣 X 元'}}</button>
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
            <button type="button" @click="closeModal" class="cancel-button button">取消</button>
            <button type="submit" class="submit-button button" :disabled="modalLoading">
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
  background: #f5f7fa;
  color: #2c3e50;
  font-family: 'Noto Sans', sans-serif;
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
  color: #34495e;
}

.button-group {
  display: flex;
  gap: 12px;
}

.add-button,
.view-available-button {
  padding: 10px 20px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.add-button {
  background: linear-gradient(90deg, #667eea, #764ba2);
  color: white;
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.view-available-button {
  background: linear-gradient(90deg, #27ae60, #2ecc71);
  color: white;
}

.view-available-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

/* ===== Status ===== */
.coupon-state {
  text-align: center;
  padding: 80px 0;
  color: #95a5a6;
  font-size: 18px;
}

.coupon-state.error {
  color: #e74c3c;
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
  border-radius: 20px;
  padding: 24px;
  color: white;
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.coupon-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.4);
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
  text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.2);
}

.coupon-status,
.coupon-quantity {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(6px);
}

.coupon-type-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(8px);
  margin-bottom: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
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
  border-radius: 10px;
  margin-bottom: 16px;
  font-size: 14px;
  border: 1px dashed rgba(255, 255, 255, 0.3);
  word-break: break-all;
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

/* Delete button */
.delete-coupon-button {
  width: 100%;
  margin-top: 16px;
  padding: 10px;
  border: none;
  border-radius: 12px;
  background: #e74c3c;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-coupon-button:hover {
  transform: translateY(-2px);
  background: #c0392b;
}

/* ===== Modal ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(4px);
  z-index: 1000;
}

.modal-content {
  background: #ffffff;
  border-radius: 20px;
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
}

.close-button {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #7f8c8d;
  transition: color 0.2s;
}

.close-button:hover {
  color: #34495e;
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
  color: #2c3e50;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #dcdcdc;
  border-radius: 12px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 8px rgba(102, 126, 234, 0.3);
}

.modal-error {
  background: #fdecea;
  color: #e74c3c;
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 16px;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-button {
  background: #ecf0f1;
  color: #7f8c8d;
}

.cancel-button:hover {
  background: #dcdde1;
}

.submit-button {
  background: #667eea;
  color: white;
}

.submit-button:hover:not(:disabled) {
  background: #5a67d8;
}

.button { 
  padding: 12px; 
  border-radius: 8px; 
  font-size: 16px; 
  font-weight: 600; 
  margin: 4px 4px; 
  border: none; 
  cursor: pointer; 
  transition: background-color 0.3s, transform 0.1s; 
}
</style>