<script setup lang="ts">
import Carousel from '../components/Carousel.vue'
import LeftMenu from '../components/LeftMenu.vue'
import BookTable from '../components/book/BookTable.vue'
import Book from '../type/book.ts'
import BookCard from '../type/bookCard.ts'
import { ref, onMounted } from "vue"
import axios from 'axios'

const books = ref<BookCard[]>([])

onMounted(async () => {
  const res = await axios.get<Book[]>("http://localhost:3000/books")
  // console.log(res.data)
  books.value = res.data.map((book: Book) => ({
    bookID: book.bookID,
    image: book.images?.find(img => img.isCover)?.imageUrl 
       ?? "http://localhost:3000/uploads/defaultImages/default_book_image.png",
    title: book.name,
    author: book.author,
    publisher: book.publisher,
    price: book.price,
    inventoryQuantity: book.inventoryQuantity
  }))
  // console.log(books.value);
});
</script>

<template>
  <main style="padding-top: 100px;">
    <LeftMenu />
    <Carousel />
    
    <div class="book-title">
      <h1>書籍列表</h1>
      <BookTable :books="books" />
    </div>
  </main>
</template>

<style scoped>
.book-title {
  padding: 20px;
  margin: 0 auto;
  padding-top: 10px;
};
</style>
