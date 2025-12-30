<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRouter } from 'vue-router'
import axios from 'axios'
import type { Subscribe } from "../type/subscribe"
import type { Member } from "../type/member"

interface MerchantSubscription extends Subscribe {
  merchant: Member
}

const router = useRouter()
const subscriptions = ref<MerchantSubscription[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const goToMerchant = (merchantID: string) => {
  router.push({ name: 'searchMerchant', params: { merchantID } })
}

onMounted(async () => {
  try {
    const token = localStorage.getItem('accessToken')

    if (!token) {
      error.value = '請先登入以查看您的訂閱'
      loading.value = false
      return
    }

    // 獲取訂閱列表
    const res = await axios.get("http://localhost:3000/subscriptions/user", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    const subscriptionList = res.data
    console.log('訂閱列表:', subscriptionList)

    // 為每個訂閱獲取商家詳細資料
    const subscriptionsWithDetails = await Promise.all(
      subscriptionList.map(async (sub: Subscribe) => {
        try {
          const merchantRes = await axios.get(`http://localhost:3000/members/${sub.merchantID}`)
          return {
            ...sub,
            merchant: merchantRes.data
          }
        } catch (err) {
          console.error(`獲取商家 ${sub.merchantID} 資料失敗:`, err)
          return {
            ...sub,
            merchant: null
          }
        }
      })
    )

    subscriptions.value = subscriptionsWithDetails.filter(sub => sub.merchant !== null)
    console.log('完整訂閱資料:', subscriptions.value)
  } catch (err: any) {
    console.error('獲取訂閱失敗:', err)
    error.value = err.response?.data?.message || '獲取訂閱列表失敗'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="subscribe-page">
    <div class="subscribe-title">
      <h1>我的訂閱</h1>
    </div>
    
    <!-- 載入中 -->
    <div v-if="loading" class="subscribe-state">
      載入中…
    </div>
    
    <!-- 錯誤 -->
    <div v-else-if="error" class="subscribe-state error">
      {{ error }}
    </div>
    
    <!-- 空狀態 -->
    <div v-else-if="subscriptions.length === 0" class="subscribe-state">
      您還沒有訂閱任何商家
    </div>
    
    <!-- 商家列表 -->
    <section v-else class="merchant-list">
      <div 
        v-for="sub in subscriptions" 
        :key="sub.merchantID"
        class="merchant-card"
        @click="goToMerchant(sub.merchantID)"
      >
        <div class="merchant-info">
          <h3 class="merchant-name">{{ sub.merchant?.merchantName || '商家名稱' }}</h3>
          <p class="merchant-account">@{{ sub.merchant?.account }}</p>
          <p class="merchant-address" v-if="sub.merchant?.merchantAddress">
            <i class="pi pi-map-marker"></i> {{ sub.merchant.merchantAddress }}
          </p>
          <p class="merchant-subscribers">
            <i class="pi pi-users"></i> {{ sub.merchant?.merchantSubscriberCount || 0 }} 位訂閱者
          </p>
        </div>
        
        <div class="subscription-status">
          <div class="notification-badge" :class="{ active: sub.notificationEnabled }">
            <i :class="sub.notificationEnabled ? 'pi pi-bell' : 'pi pi-bell-slash'"></i>
            <span>{{ sub.notificationEnabled ? '通知已開啟' : '通知已關閉' }}</span>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* ===== Page ===== */
.subscribe-page {
  min-height: 100vh;
  padding: 100px 24px 48px;
  background: var(--color-bg-page);
  color: var(--color-text-primary);
}

.subscribe-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.subscribe-title h1 {
  font-size: 32px;
  font-weight: 800;
}

/* 狀態 */
.subscribe-state {
  text-align: center;
  padding: 80px 0;
  color: var(--color-text-secondary);
}

.subscribe-state.error {
  color: var(--color-danger);
}

/* ===== List ===== */
.merchant-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* ===== Card ===== */
/* ===== Card ===== */
.merchant-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 18px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.merchant-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.merchant-info {
  margin-bottom: 16px;
}

.merchant-name {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.merchant-account {
  color: #666;
  font-size: 14px;
  margin-bottom: 12px;
}

.merchant-address,
.merchant-subscribers {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}

.merchant-address i,
.merchant-subscribers i {
  color: #667eea;
}

.subscription-status {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.notification-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  background: #f5f5f5;
  color: #999;
  font-size: 13px;
}

.notification-badge.active {
  background: #e8f5e9;
  color: #4caf50;
}

.notification-badge i {
  font-size: 14px;
}

/* 響應式設計 */
@media (max-width: 1024px) {
  .merchant-list {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .merchant-list {
    grid-template-columns: 1fr;
  }
  
  .subscribe-title h1 {
    font-size: 24px;
  }
}
</style>
