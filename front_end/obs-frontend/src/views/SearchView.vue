<script setup lang="ts">
import { ref, watch  } from 'vue';
import axios from "axios";
import { useRoute } from 'vue-router';
import LeftMenu from '../components/LeftMenu.vue'
import BookTable from '../components/book/BookTable.vue'
import Book from '../type/book.ts'

const route = useRoute();
const results = ref([]);

async function search() {
  if (route.query.cat != undefined) {
    if (route.query.q === undefined) {
      const res = await axios.get(`http://localhost:3000/belongs-to/category/${route.query.cat as string}`);
      console.log(res.data);
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
  }
  else {
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
}

watch(
  () => [route.query.q, route.query.cat],
  () => {
    search();
  }
);

search();
</script>

<template>
  <LeftMenu />
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