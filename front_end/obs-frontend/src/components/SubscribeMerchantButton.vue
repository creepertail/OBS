<script setup lang="ts">
import { ref, watch } from "vue"
import axios from "axios"

const props = defineProps({
  merchantID: { type: String, required: true },
  isSubscribed: { type: Boolean, required: true },
  notificationEnabled: { type: Boolean, required: true }
})

const emit = defineEmits<{
  (e: "update:isSubscribed", val: boolean): void
  (e: "update:notificationEnabled", val: boolean): void
}>()

const token = localStorage.getItem("accessToken")
const isLoading = ref(false)

/** UI 狀態只跟 props 同步 */
const isSubscribed = ref(false)
const notifyEnabled = ref(false)

watch(
  () => props.isSubscribed,
  val => (isSubscribed.value = val),
  { immediate: true }
)

watch(
  () => props.notificationEnabled,
  val => (notifyEnabled.value = val),
  { immediate: true }
)

async function subscribeMerchant() {
  if (!token) return alert("請先登入")

  try {
    isLoading.value = true

    await axios.post(
      "http://localhost:3000/subscriptions",
      {
        merchantID: props.merchantID,
        notificationEnabled: true
      },
      { headers: { Authorization: `Bearer ${token}` } }
    )

    emit("update:isSubscribed", true)
    emit("update:notificationEnabled", true)
  } catch {
    alert("訂閱失敗")
  } finally {
    isLoading.value = false
  }
}

async function unsubscribeMerchant() {
  if (!token) return alert("請先登入")

  try {
    isLoading.value = true

    await axios.delete(
      `http://localhost:3000/subscriptions/${props.merchantID}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    emit("update:isSubscribed", false)
    emit("update:notificationEnabled", false)
  } catch {
    alert("取消訂閱失敗")
  } finally {
    isLoading.value = false
  }
}

async function toggleNotify() {
  if (!token) return alert("請先登入")

  try {
    await axios.patch(
      `http://localhost:3000/subscriptions/${props.merchantID}`,
      { notificationEnabled: !notifyEnabled.value },
      { headers: { Authorization: `Bearer ${token}` } }
    )

    emit("update:notificationEnabled", !notifyEnabled.value)
  } catch {
    alert("更新通知失敗")
  }
}
</script>

<template>
  <div class="subscribe-actions">
    <button
      class="merchant-info__btn merchant-info__btn--subscribe"
      :disabled="isLoading"
      @click="isSubscribed ? unsubscribeMerchant() : subscribeMerchant()"
    >
      {{ isSubscribed ? "取消訂閱" : "訂閱商家" }}
    </button>

    <button
      v-if="isSubscribed"
      class="merchant-info__btn merchant-info__btn--icon"
      @click="toggleNotify"
    >
      <i
        :class="[
          'pi',
          notifyEnabled ? 'pi-bell' : 'pi-bell-slash'
        ]"
      />
    </button>
  </div>
</template>


<style scoped>
/* 右側按鈕 */
.merchant-info__action {
  flex-shrink: 0;
  margin-left: auto;
}

.merchant-info__btn {
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  background: var(--color-bg-card);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);

  transition: background-color 0.2s ease, transform 0.15s ease;
}

.merchant-info__btn:hover {
  background: var(--color-background-soft);
  transform: translateY(-1px);
}

/* 訂閱按鈕 */
.merchant-info__btn--subscribe {
  margin-bottom: 8px;
  margin-right: 8px;
  background: var(--color-accent);
  color: #ffffff;
  border: none;
}

.merchant-info__btn--subscribe:hover:not(:disabled) {
  background: #1d4ed8;
}

.merchant-info__btn--subscribe:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 兩個按鈕容器 */
.subscribe-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

/* icon 按鈕 */
.merchant-info__btn--icon {
  padding: 10px;
  width: 40px;
  height: 40px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  background: var(--color-bg-card);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.merchant-info__btn--icon:hover {
  background: var(--color-bg-muted);
}

.merchant-info__btn--icon i {
  font-size: 16px;
}

</style>
