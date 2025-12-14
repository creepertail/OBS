<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRoute } from "vue-router"
import axios from "axios"

interface BookDetail {
  bookID: string
  ISBN: string
  name: string
  images: {
    imageId: string
    imageUrl: string
    displayOrder: number
    isCover: boolean
  }[]
  price: number
  author: string
  publisher: string
  productDescription: string
  inventoryQuantity: number
}

const route = useRoute()
const book = ref<BookDetail | null>(null)
const loading = ref(true)
const errorMsg = ref("")

onMounted(async () => {
  try {
    const id = route.params.id
    const res = await axios.get<BookDetail>(`http://localhost:3000/books/${id}`)
    book.value = res.data
  } catch (e) {
    errorMsg.value = "無法載入書籍資料"
  } finally {
    loading.value = false
  }
})

function addToCart() {
  alert("已加入購物車！")
}

function buyNow() {
  alert("前往結帳頁面！")
}
</script>

<template>
  <div class="max-w-5xl mx-auto p-6" v-if="!loading && book">
    <!-- 上半部：圖片 + 資訊 -->
    <div class="flex flex-col lg:flex-row gap-8">

      <!-- 書籍圖片 -->
      <div class="w-full lg:w-1/3">
        <img
          :src="book.images.find(i => i.isCover)?.imageUrl || '/default-book.png'"
          class="w-full h-[400px] object-contain bg-gray-100 rounded shadow"
          alt="book cover"
        />
      </div>

      <!-- 書籍資訊 -->
      <div class="flex-1 space-y-4">
        <h1 class="text-3xl font-bold">{{ book.name }}</h1>
        
        <p class="text-gray-700 text-lg"><b>作者：</b> {{ book.author }}</p>
        <p class="text-gray-700 text-lg"><b>出版社：</b> {{ book.publisher }}</p>
        <p class="text-gray-700"><b>ISBN：</b> {{ book.ISBN }}</p>

        <p class="text-2xl text-red-600 font-bold">
          NT$ {{ book.price }}
        </p>

        <p class="text-gray-600">
          庫存：<b>{{ book.inventoryQuantity }}</b>
        </p>

        <!-- 按鈕 -->
        <div class="flex gap-4 mt-6">
          <button
            @click="addToCart"
            class="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg shadow"
          >
            加入購物車
          </button>

          <button
            @click="buyNow"
            class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow"
          >
            立即購買
          </button>
        </div>
      </div>
    </div>

    <!-- 下半部：商品描述 -->
    <div class="mt-12">
      <h2 class="text-2xl font-bold mb-4">內容介紹</h2>
      <p class="text-gray-800 leading-relaxed whitespace-pre-line">
        {{ book.productDescription }}
      </p>
    </div>
  </div>

  <!-- Loading 狀態 -->
  <div v-else-if="loading" class="text-center py-10 text-gray-500 text-lg">
    正在載入書籍資料...
  </div>

  <!-- Error 狀態 -->
  <div v-else class="text-center py-10 text-red-500 text-lg">
    {{ errorMsg }}
  </div>
</template>

<style scoped>
</style>
