<script setup lang="ts">
import { ref, watch  } from 'vue';
import axios from "axios";
import { useRoute } from 'vue-router';
import BookTable from '../components/book/BookTable.vue'
import Book from '../type/book.ts'

const route = useRoute();
const results = ref([]);

async function search() {
  const res = await axios.get(`http://localhost:3000/books/search?keyword=${route.query.q as string}`);
  results.value = res.data.map((book: Book) => ({
    bookID: book.bookID,
    image: book.images?.find(img => img.isCover)?.imageUrl 
       ?? "http://localhost:3000/uploads/defaultImages/default_book_image.png",
    title: book.name,
    author: book.author,
    publisher: book.publisher,
    price: book.price,
    inventoryQuantity: book.inventoryQuantity
  }));
}

watch(
  () => route.query.q,
  () => {
    search();
  }
);

search();
</script>

<template>
  <div class="book-title">
    <BookTable :books="results" />
  </div>
</template>>

<style scoped>
.book-title {
  padding: 20px;
  margin: 0 auto;
  padding-top: 100px;
};
</style>