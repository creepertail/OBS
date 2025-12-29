<script setup lang="ts">
import LeftMenu from '../components/LeftMenu.vue'
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
  <main style="padding-top: 100px;">
    <LeftMenu />
    
    <div class="favorite-container">
      <h1>我的收藏</h1>
      
      <div v-if="loading" class="loading">
        載入中...
      </div>
      
      <div v-else-if="error" class="error">
        {{ error }}
      </div>
      
      <div v-else-if="books.length === 0" class="empty">
        您還沒有收藏任何書籍
      </div>
      
      <BookTable v-else :books="books" />
    </div>
  </main>
</template>

<style scoped>
.favorite-container {
  padding: 20px;
  margin: 0 auto;
  padding-top: 10px;
}

.loading, .error, .empty {
  text-align: center;
  padding: 40px;
  font-size: 18px;
}

.error {
  color: #d9534f;
}

.empty {
  color: #666;
}
</style>
