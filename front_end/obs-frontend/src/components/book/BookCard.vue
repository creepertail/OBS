<template>
  <RouterLink
    :to="`/books/${bookID}`"
    class="book-link"
  >
    <div class="book-card">
      <div class="image-wrapper">
        <img :src="image" alt="book cover" />
      </div>

      <div class="book-info">
        <h3 class="book-title">{{ title }}</h3>
        <p class="book-author">作者：{{ author }}</p>
        <p class="book-publisher">出版社：{{ publisher }}</p>

        <p class="book-price">
          NT$ {{ price }}
          <span v-if="isSoldOut" class="sold-out">(售完)</span>
        </p>
      </div>
    </div>
  </RouterLink>
</template>


<script setup>
const props = defineProps({
  bookID: { type: String, required: true },
  image: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  publisher: { type: String, required: true },
  price: { type: Number, required: true },
  inventoryQuantity:{ type: Number, required: true }
});

const isSoldOut = (props.inventoryQuantity == 0)? true: false; 

console.log("bookID =", props.bookID);
</script>

<style scoped>
/* .book-card {
  width: 200px;
  height: 100%;
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
} */

.book-card {
  
  width: 200px;
  height: 100%;
  /* border: 1px solid #ddd; */
  /* border-radius: 8px; */
  overflow: hidden;
  padding: 12px;
  /* background: gray; */
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: 0.2s ease;

  background-color: var(--color-bg-card);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.book-card:hover {
  border-color: var(--color-border-hover);
}


.image-wrapper {
  height: 250px;        
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center; 
  overflow: hidden;    
}

.image-wrapper img {
  height: 100%;
  width: auto;
  object-fit: contain;
}

/* .book-author,
.book-publisher {
} */

.book-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  height: 100%;
  /* color: black; */
  color: var(--color-text-secondary);
}

.book-title {
  font-size: 18px;
  font-weight: bold;
}

.book-price {
  /* color: #d9534f; */
  color: darkred;
  font-weight: bold;
  margin-top: auto;
}
</style>
