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
  <main style="padding-top: 100px;">
    <div class="page">
      <div class="member-title">
        <h1>會員管理列表</h1>
      </div>
      <MemberList :members="members" />
    </div>
  </main>
</template>

<style scoped>
.page {
  padding: 20px;
  margin: 0 auto;
  padding-top: 10px;
  max-width: 1400px;
}

.member-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.member-title h1 {
  margin: 0;
}
</style>