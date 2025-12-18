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
    image: product.images?.find(img => img.isCover)?.imageUrl 
      ?? "http://localhost:3000/uploads/defaultImages/default_book_image.png",
    title: product.name,
    author: product.author,
    publisher: product.publisher,
    price: product.price
  }));
})
</script>

<template>
  <main style="padding-top: 100px;">
    <div class="page">
      <div class="product-title">
        <h1>商家商品列表</h1>
        <button class="button" @click="router.push({ name: 'addProduct' })">新增商品</button>
      </div>
      <ProductList :products="products" />
    </div>
  </main>
</template>


<style scoped>
.page{
  padding: 20px;
  margin: 0 auto;
  padding-top: 10px;
}
.product-title {
  display: flex; 
  align-items: center; 
  justify-content: space-between;
};
</style>
