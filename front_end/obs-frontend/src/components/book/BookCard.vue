<template>
  <div class="book-card">
    <div class="image-wrapper">
      <img :src="image" alt="book cover" class="book-image" />
    </div>

    <div class="book-info">
      <h3 class="book-title">{{ title }}</h3>
      <p class="book-author">作者：{{ author }}</p>
      <p class="book-publisher">出版社：{{ publisher }}</p>
      <p class="book-price">NT$ {{ price }}<div v-if="isSoldOut">(售完)</div></p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  image: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  publisher: { type: String, required: true },
  price: { type: Number, required: true },
  inventoryQuantity:{ type: Number, required: true }
});

const isSoldOut = (props.inventoryQuantity == 0)? true: false; 

console.log("image =", props.image);
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

.image-wrapper {
  height: 300px;        
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center; 
  overflow: hidden;    
}

.image-wrapper img {
  height: 100%;      /* 高度填滿 200px */
  width: auto;       /* 寬度依比例 */
  object-fit: contain;  /* 不裁切圖片 */
}

.book-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  height: 100%;
}

.book-title {
  font-size: 18px;
  font-weight: bold;
}

.book-price {
  color: #d9534f;
  font-weight: bold;
  margin-top: auto;
}
</style>
