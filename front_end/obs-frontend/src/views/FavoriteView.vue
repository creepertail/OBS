<script setup lang="ts">
import BookTable from '../components/book/BookTable.vue'
import BookCard from '../type/bookCard.ts'
import { ref, onMounted } from "vue"
import axios from 'axios'

const books = ref<BookCard[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    // 从 localStorage 获取 access_token
    const token = localStorage.getItem('accessToken')

    if (!token) {
      error.value = '請先登入以查看您的收藏'
      loading.value = false
      return
    }

    const res = await axios.get("http://localhost:3000/favorites/mine", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    // 处理返回的收藏数据，映射为 BookCard 格式
    books.value = res.data.map((favorite: any) => ({
      bookID: favorite.book.bookID,
      image: favorite.book.images?.find((img: any) => img.isCover)?.imageUrl 
         ?? "http://localhost:3000/uploads/defaultImages/default_book_image.png",
      title: favorite.book.name,
      author: favorite.book.author,
      publisher: favorite.book.publisher,
      price: favorite.book.price,
      inventoryQuantity: favorite.book.inventoryQuantity
    }))
  } catch (err: any) {
    console.error('獲取收藏失敗:', err)
    error.value = err.response?.data?.message || '獲取收藏列表失敗'
  } finally {
    loading.value = false
  }
});
</script>

<template>
  <main class="favorite-page">    
    <div class="favorite-title">
      <h1>我的收藏</h1>
    </div>
    
    <!-- 載入中 -->
    <div v-if="loading" class="favorite-state">
      載入中…
    </div>
    
    <!-- 錯誤 -->
    <div v-else-if="error" class="favorite-state error">
      {{ error }}
    </div>
    
    <!-- 空狀態 -->
    <div v-else-if="books.length === 0" class="favorite-state">
      您還沒有收藏任何書籍
    </div>
    
    <!-- 書籍列表 -->
    <section v-else class="favorite-content">
      <BookTable :books="books" />
    </section>
  </main>
</template>

<style scoped>
/* ===== Page ===== */
.favorite-page {
  min-height: 100vh;
  padding: 100px 24px 48px;
  background: var(--color-bg-page);
  color: var(--color-text-primary);
}

.favorite-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.favorite-title h1 {
  font-size: 32px;
  font-weight: 800;
}

/* 狀態 */
.favorite-state {
  text-align: center;
  padding: 80px 0;
  color: var(--color-text-secondary);
}

.favorite-state.error {
  color: var(--color-danger);
}

/* ===== Content ===== */
.favorite-content {
  max-width: 1200px;
  margin: 0 auto;
}

/* 響應式 */
@media (max-width: 768px) {
  .favorite-title h1 {
    font-size: 24px;
  }
}
</style>
