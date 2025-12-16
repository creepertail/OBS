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

  /* 關鍵差異在 auto-fill */
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));

  gap: 20px;
  padding: 10px 0;
}

</style>
