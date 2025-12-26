<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Book from '../type/book.ts'
import ProductCard from '../type/productCard.ts'
import ProductList from '../components/merchant/MerchantProductList.vue'
import { useRouter } from 'vue-router';

const router = useRouter();
const products = ref<ProductCard[]>([])

onMounted(async () => {
  const res = await axios.get<Book[]>("http://localhost:3000/members/merchantWithBooks", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`
    }
  });
  products.value = res.data.books.map((product: Book) => ({
    bookID: product.bookID,
    image: product.images?.find(img => img.isCover)?.imageUrl 
      ?? "http://localhost:3000/uploads/defaultImages/default_book_image.png",
    title: product.name,
    author: product.author,
    publisher: product.publisher,
    price: product.price,
    status: product.status
  }));
})
</script>

<template>
  <main class="page">
      <div class="product-title">
        <h1>商家商品列表</h1>
        <button class="add-button" @click="router.push({ name: 'addProduct' })">新增商品</button>
      </div>
      <ProductList :products="products" />
  </main>
</template>


<style scoped>
.page{
  min-height: 100vh;
  padding: 100px 24px 48px;
  background: var(--color-bg-page);
  color: var(--color-text-primary);
}

.product-title {
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  margin-bottom: 32px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.product-title h1 {
  font-size: 32px;
  font-weight: 800;
}

.add-button {
  margin-top: 10px;
  padding: 8px;
  border: none;
  background: #3498db;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: 0.2s;
}

.add-button:hover {
  background: #2980b9;
}
</style>
