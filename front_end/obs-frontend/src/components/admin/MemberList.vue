<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import type { Member } from '../../type/member'

const props = defineProps<{
  members: Member[]
}>()

const userStateOptions = [
  { value: 0, label: '可下訂單且可留言' },
  { value: 1, label: '不可下訂單但可留言' },
  { value: 2, label: '可下訂單但不可留言' },
  { value: 3, label: '不可下訂單且不可留言' }
]

const updating = ref<{ [key: string]: boolean }>({})

const updateUserState = async (member: Member, newState: number) => {
  updating.value[member.memberID] = true
  try {
    await axios.patch(
      `http://localhost:3000/members/${member.memberID}`,
      { userState: newState },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
      }
    )
    member.userState = newState
    alert('權限更新成功')
  } catch (error) {
    console.error('Failed to update user state:', error)
    alert('權限更新失敗')
  } finally {
    updating.value[member.memberID] = false
  }
}
</script>

<template>
  <div class="member-list">
    <table class="member-table">
      <thead>
        <tr>
          <th>帳號</th>
          <th>類型</th>
          <th>用戶名稱</th>
          <th>電子郵件</th>
          <th>電話號碼</th>
          <th>用戶權限</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="member in members" :key="member.memberID">
          <td>{{ member.account }}</td>
          <td>{{ member.type }}</td>
          <td>{{ member.userName || member.merchantName || '-' }}</td>
          <td>{{ member.email }}</td>
          <td>{{ member.phoneNumber }}</td>
          <td>
            <select 
              v-if="member.type === 'user'"
              :value="member.userState"
              @change="updateUserState(member, parseInt(($event.target as HTMLSelectElement).value))"
              :disabled="updating[member.memberID]"
              class="user-state-select"
            >
              <option 
                v-for="option in userStateOptions" 
                :key="option.value" 
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
            <span v-else class="not-applicable">-</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.member-list {
  width: 100%;
  overflow-x: auto;
}

.member-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.member-table thead {
  background: #3498db;
  color: white;
}

.member-table th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
}

.member-table tbody tr {
  border-bottom: 1px solid #e0e0e0;
  transition: background-color 0.2s;
}

.member-table tbody tr:hover {
  background-color: #f5f5f5;
}

.member-table tbody tr:last-child {
  border-bottom: none;
}

.member-table td {
  padding: 15px;
  font-size: 14px;
}

.user-state-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  background: white;
  transition: border-color 0.2s;
}

.user-state-select:hover {
  border-color: #3498db;
}

.user-state-select:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.not-applicable {
  color: #999;
}
</style>
