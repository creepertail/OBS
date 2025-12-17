<script setup lang="ts">
import { ref } from 'vue';
import { MagnifyingGlassIcon } from '@heroicons/vue/24/solid'
import { useRouter } from 'vue-router';

const router = useRouter();
const keyword = ref("");

async function search() {
  router.push({ name: 'search', query: { q: keyword.value } });
}
</script>

<template>
  <div class="search-box">
    <MagnifyingGlassIcon class="search-btn" @click="search"/>
    <input v-model="keyword" placeholder="搜尋" @keypress.enter="search"/>
  </div>
</template>

<style scoped>
.search-box {
  display: flex;
  justify-content: center;
  align-items: center;
}

.search-btn {
  width: 48px;
  height: 48px;
  color: aliceblue;
  padding: 0 5px;
  cursor: pointer;
}
</style>