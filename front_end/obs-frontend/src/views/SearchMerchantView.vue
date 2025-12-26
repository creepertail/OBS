<script setup lang="ts">
import { ref, onMounted, watch } from "vue"
import { useRoute } from "vue-router"
import axios from "axios"
import BookTable from "@/components/book/BookTable.vue"
import SubscribeButton from '../components/SubscribeMerchantButton.vue'
import type { Book } from "../type/book"
import type { BookCard } from "../type/bookCard"
import type { Subscribe } from "../type/subscribe"

const route = useRoute()
const merchantID = ref(route.params.merchantID as string)
const merchant = ref<any>(null)
const subscribe = ref<Subscribe>({
  userID: "",
  merchantID: "",
  notificationEnabled: false
})
const books = ref<BookCard[]>([])
const loading = ref(false)

const isSubscribed = ref(false)
watch(
  () => subscribe.value,
  (val) => {
    isSubscribed.value = !!(
      val &&
      val.userID &&
      val.merchantID
    )
  },
  { immediate: true }
)

const fetchMerchant = async () => {
  try {
    const res = await axios.get(`http://localhost:3000/members/MerchantInfoWithBook/${merchantID.value}`)
    console.log("res", res)

    merchant.value = res.data

    const rawbooks = ref<Book[]>(res.data.books)

    console.log("rawbook", rawbooks.value)
    books.value = rawbooks.value.map((book: Book) => ({
      bookID: book.bookID,
      image: book.images?.find(img => img.isCover)?.imageUrl 
        ?? "http://localhost:3000/uploads/defaultImages/default_book_image.png",
      title: book.name,
      author: book.author,
      publisher: book.publisher,
      price: book.price,
      inventoryQuantity: book.inventoryQuantity
    }))
    
    console.log("books", books.value)
  } catch (err) {
    console.error("取得商家資料失敗", err)
  } finally {
    loading.value = false
  }
  
  try {
    const token = localStorage.getItem("accessToken")
    if (!token) return

    const res = await axios.get<Subscribe>(
      `http://localhost:3000/subscriptions/isUserSubscribedToMerchant/${merchantID.value}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    subscribe.value = res.data ?? null
  } catch {
    subscribe.value = null
  }
}

onMounted(fetchMerchant)

</script>

<template>
  <div class="search-merchant-view" style="padding-top: 100px;">
    <div v-if="loading" class="loading">
      載入中...
    </div>

    <template v-else-if="merchant">
      <!-- 商家資訊 -->
      <section class="merchant-info">
        <div class="merchant-header">
          <h2 class="merchant-name">{{ merchant.merchantName }}</h2>
          <span class="merchant-tag">商家</span>
          <SubscribeButton
            :merchantID="merchant.memberID"
            v-model:isSubscribed="isSubscribed"
            v-model:notificationEnabled="subscribe.notificationEnabled"
            style="margin-left: auto"
          />
        </div>

        <ul class="merchant-meta">
          <li><strong>地址：</strong>{{ merchant.merchantAddress }}</li>
          <li><strong>Email：</strong>{{ merchant.email }}</li>
          <li><strong>電話：</strong>{{ merchant.phoneNumber }}</li>
          <li>
            <strong>訂閱數：</strong>
            {{ merchant.merchantSubscriberCount }}
          </li>
        </ul>
      </section>

      <!-- 書籍列表 -->
      <section class="merchant-books">
        <h3 class="section-title">商品列表</h3>
        <BookTable :books="books" />
      </section>
    </template>

    <div v-else class="empty">
      查無商家資料
    </div>
  </div>
</template>

<style scoped>
/* =========================================
   Layout
   ========================================= */

.search-merchant-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
  min-height: 100vh;
}

/* =========================================
   States
   ========================================= */

.loading,
.empty {
  padding: 96px 0;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 15px;
}

/* =========================================
   Merchant info card
   ========================================= */

.merchant-info {
  background-color: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 28px 32px;
  margin-bottom: 28px;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
}

.merchant-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}

.merchant-name {
  font-size: 26px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.2;
}

.merchant-tag {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 999px;
  background-color: var(--color-bg-muted);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

/* Merchant meta list */

.merchant-meta {
  list-style: none;
  display: grid;
  grid-template-columns: 1fr 1fr;
  row-gap: 10px;
  column-gap: 24px;
  padding: 0;
}

.merchant-meta li {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.merchant-meta strong {
  color: var(--color-text-primary);
  font-weight: 500;
}

/* =========================================
   Books section
   ========================================= */

.merchant-books {
  background-color: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 28px 32px;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--color-text-primary);
}

.section-title::before {
  content: "";
  width: 4px;
  height: 20px;
  border-radius: 2px;
  background-color: var(--color-accent);
  margin-right: 12px;
}

/* =========================================
   Table integration (BookTable friendly)
   ========================================= */

.merchant-books table {
  width: 100%;
  border-collapse: collapse;
}

.merchant-books th,
.merchant-books td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--color-border);
  font-size: 14px;
  text-align: left;
}

.merchant-books th {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.merchant-books tr:hover td {
  background-color: var(--color-bg-muted);
}

/* =========================================
   Responsive
   ========================================= */

@media (max-width: 768px) {
  .merchant-info,
  .merchant-books {
    padding: 20px;
  }

  .merchant-meta {
    grid-template-columns: 1fr;
  }

  .merchant-name {
    font-size: 22px;
  }
}

</style>