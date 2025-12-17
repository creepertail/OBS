<template>
  <div class="product-card">
    <img :src="image" class="thumbnail" alt="商品圖片" />

    <div class="info">
      <h3>{{ title }}</h3>
      <p class="author">{{ author }}</p>
      <p class="publisher">出版社：{{ publisher }}</p>

      <p class="price">$ {{ price }}</p>

      <button class="edit-btn" @click="router.push({ name: 'editProduct' })">編輯商品</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

defineProps({
  image: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  publisher: { type: String, required: true },
  price: { type: Number, required: true }
});
</script>

<style scoped>
.product-card {
  width: 250px;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  padding-bottom: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: 0.25s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.15);
}

.thumbnail {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.info {
  padding: 10px 14px;
}

.author {
  color: #666;
  font-size: 14px;
}

.publisher {
  font-size: 13px;
  color: #999;
}

.price {
  margin-top: 8px;
  font-weight: bold;
  font-size: 20px;
  color: #e67e22;
}

.edit-btn {
  margin-top: 10px;
  width: 100%;
  padding: 8px;
  border: none;
  background: #3498db;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: 0.2s;
}

.edit-btn:hover {
  background: #2980b9;
}
</style>
