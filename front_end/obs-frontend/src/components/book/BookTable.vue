<template>
  <div class="book-table">
    <BookCard
      v-for="book in books"
      :key="book.bookID"
      v-bind="book"
    />
  </div>
</template>

<script setup>
import BookCard from './BookCard.vue'

const props = defineProps({
  books: {
    type: Array,
    required: true
  }
})
</script>

<style scoped>
.book-table {
  display: grid;

  /* 一列 5 個，會自動換行 */
  grid-template-columns: repeat(5, 1fr);

  gap: 20px;

  /* 可視需要調整 padding */
  padding: 10px 0;
}
</style>
