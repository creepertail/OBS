<template>
  <div class="book-card">
    <img :src="image" alt="book cover" class="book-image" />

    <div class="book-info">
      <h3 class="book-title">{{ title }}</h3>
      <p class="book-author">作者：{{ author }}</p>
      <p class="book-publisher">出版社：{{ publisher }}</p>
      <p class="book-price">NT$ {{ price }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  image: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  publisher: { type: String, required: true },
  price: { type: Number, required: true }
});
</script>

<style scoped>
.book-card {
  width: 200px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  padding: 12px;
  background: gray;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: 0.2s ease;
}

.book-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.book-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
}

.book-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.book-title {
  font-size: 18px;
  font-weight: bold;
}

.book-price {
  color: #d9534f;
  font-weight: bold;
  margin-top: 5px;
}
</style>
