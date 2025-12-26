<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import type { Member } from '../type/member'
import MemberList from '../components/admin/MemberList.vue'

const members = ref<Member[]>([])

onMounted(async () => {
  try {
    const res = await axios.get<Member[]>("http://localhost:3000/members", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`
      }
    })
    members.value = res.data
  } catch (error) {
    console.error('Failed to fetch members:', error)
  }
})
</script>

<template>
  <main class="page">
      <div class="member-title">
        <h1>會員管理列表</h1>
      </div>
      <MemberList :members="members" />
  </main>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding: 100px 24px 48px;
  background: var(--color-bg-page);
  color: var(--color-text-primary);
}

.member-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.member-title h1 {
  font-size: 32px;
  font-weight: 800;
}
</style>