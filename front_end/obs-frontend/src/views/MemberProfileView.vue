<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { useRouter } from "vue-router"
import axios from "axios"
import type { Member } from "@/type/member"

interface UserLevelInfo {
  level: number
  totalSpent: number
}

const router = useRouter()
const member = ref<Member | null>(null)
const userLevelInfo = ref<UserLevelInfo | null>(null)
const loading = ref(true)

const token = localStorage.getItem("accessToken")

/* ===== 角色判斷 ===== */
const isUser = computed(() => member.value?.type === "user")
const isMerchant = computed(() => member.value?.type === "merchant")
const isAdmin = computed(() => member.value?.type === "admin")

onMounted(async () => {
  if (!token) return

  try {
    /* 取得會員基本資料 */
    const memberRes = await axios.get<Member>(
      "http://localhost:3000/members/me",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    member.value = memberRes.data

    /* 只有 user 才查 Level */
    if (member.value.type === "user") {
      const levelRes = await axios.get<UserLevelInfo>(
        "http://localhost:3000/members/me/level",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      userLevelInfo.value = levelRes.data
    }
  } catch (err) {
    console.error("取得會員資料失敗", err)
  } finally {
    loading.value = false
  }
})

function goToSettingPage() {
  router.push({
    name: 'setting'
  })
}
</script>

<template>
<main class="profile-page" v-if="!loading && member">

  <!-- ===== User 等級區塊 ===== -->
  <section v-if="isUser && userLevelInfo" class="level-banner">
    <div class="level">
      Lv. {{ userLevelInfo.level }}
    </div>
    <div class="spent">
      累積消費：NT$ {{ userLevelInfo.totalSpent }}
    </div>
  </section>

  <!-- ===== 基本資料 ===== -->
  <section class="card">
    <div class="card--info">
      <h2>個人資訊</h2>

      <button class="button" 
        @click.stop
        @click="goToSettingPage()"
      >編輯資料</button>
    </div>
    
    <p><strong>帳號：</strong>{{ member.account }}</p>
    <p><strong>Email：</strong>{{ member.email }}</p>
    <p v-if="isUser"><strong>姓名：</strong>{{ member.userName }}</p>
    <p><strong>電話：</strong>{{ member.phoneNumber }}</p>
    <p><strong>身分：</strong>{{ member.type }}</p>
  </section>

  <!-- ===== Merchant 專屬 ===== -->
  <section v-if="isMerchant" class="card">
    <h2>商家資訊</h2>
    <p><strong>商家名稱：</strong>{{ member.merchantName }}</p>
    <p><strong>商家地址：</strong>{{ member.merchantAddress }}</p>
    <p><strong>訂閱人數：</strong>{{ member.merchantSubscriberCount }}</p>
    <p><strong>商家狀態：</strong>{{ member.merchantState }}</p>
  </section>

  <!-- ===== Admin 專屬 ===== -->
  <section v-if="isAdmin" class="card admin">
    <h2>管理員資訊</h2>
    <p>您擁有系統管理權限</p>
  </section>

</main>
</template>

<style scoped>
.profile-page {
  max-width: 720px;
  margin: 120px auto;
  padding: 0 16px;
}

.level-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #2563eb, #60a5fa);
  color: white;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 24px;
}

.level {
  font-size: 28px;
  font-weight: 800;
}

.spent {
  font-size: 14px;
  opacity: 0.9;
}

.card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 20px;
}

.card--info {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
}

.card h2 {
  margin-bottom: 12px;
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

.card p {
  margin: 6px 0;
}

.admin {
  border-color: #f59e0b;
}
</style>