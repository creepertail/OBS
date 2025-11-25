<script setup lang="ts">
import Carousel from '../components/Carousel.vue'
import LeftMenu from '../components/LeftMenu.vue'
import BookTable from '../components/book/BookTable.vue'
import { ref } from "vue"

const books = ref([
  {
    id: 1,
    title: "全知讀者視角 1",
    author: "sing N song",
    publisher: "深空出版",
    price: 450,
    image: "https://s2.eslite.com/unsafe/fit-in/x320/smart/filters:sharpen(sigma):format(webp)/s.eslite.com/upload/product/o/2682039672007/20210724053726916816.jpg",
  },
  {
    id: 2,
    title: "全知讀者視角 2",
    author: "sing N song",
    publisher: "深空出版",
    price: 450,
    image: "https://s2.eslite.com/unsafe/fit-in/x320/smart/filters:sharpen(sigma):format(webp)/s.eslite.com/upload/product/o/2682039724003/20210724053547668664.jpg",
  },
  {
    id: 3,
    title: "全知讀者視角 3",
    author: "sing N song",
    publisher: "深空出版",
    price: 450,
    image: "https://s2.eslite.com/unsafe/fit-in/x320/smart/filters:sharpen(sigma):format(webp)/s.eslite.com/upload/product/o/2682122323007/20220114035847568446.jpg",
  },
  {
    id: 4,
    title: "全知讀者視角 4",
    author: "sing N song",
    publisher: "深空出版",
    price: 450,
    image: "https://s2.eslite.com/unsafe/fit-in/x320/filters:format(webp)/s.eslite.com/upload/product/o/2682186418008/20220702054050116867.jpg",
  },
  {
    id: 5,
    title: "全知讀者視角 5",
    author: "sing N song",
    publisher: "深空出版",
    price: 450,
    image: "https://s2.eslite.com/unsafe/fit-in/x320/smart/filters:sharpen(sigma):format(webp)/s.eslite.com/upload/product/o/2682186420001/20220702054409925205.jpg",
  },
  {
    id: 6,
    title: "全知讀者視角 6",
    author: "sing N song",
    publisher: "深空出版",
    price: 450,
    image: "https://s2.eslite.com/unsafe/fit-in/x320/filters:format(webp)/s.eslite.com/upload/product/o/2682319662001/20221227032110043280.jpg",
  },
  {
    id: 7,
    title: "全知讀者視角 7",
    author: "sing N song",
    publisher: "深空出版",
    price: 450,
    image: "https://s2.eslite.com/unsafe/fit-in/x320/smart/filters:sharpen(sigma):format(webp)/s.eslite.com/b2b/newItem/2023/06/27/202306271638429786269702084-00.jpg",
  },
  {
    id: 8,
    title: "全知讀者視角 8",
    author: "sing N song",
    publisher: "深空出版",
    price: 450,
    image: "https://s2.eslite.com/unsafe/fit-in/x320/smart/filters:sharpen(sigma):format(webp)/s.eslite.com/b2b/newItem/2023/06/27/202306271641079786269702091-00.jpg",
  },
  {
    id: 9,
    title: "全知讀者視角 9",
    author: "sing N song",
    publisher: "深空出版",
    price: 450,
    image: "https://s2.eslite.com/unsafe/fit-in/x320/smart/filters:sharpen(sigma):format(webp)/s.eslite.com/b2b/newItem/2023/12/21/155_135534750_719_mainCoverImage1.jpg",
  },
  {
    id: 10,
    title: "全知讀者視角 10",
    author: "sing N song",
    publisher: "深空出版",
    price: 450,
    image: "https://s2.eslite.com/unsafe/fit-in/x320/smart/filters:sharpen(sigma):format(webp)/s.eslite.com/b2b/newItem/2023/12/21/155_135545791_856_mainCoverImage1.jpg",
  },
  {
    id: 11,
    title: "全知讀者視角 11",
    author: "sing N song",
    publisher: "深空出版",
    price: 450,
    image: "https://s2.eslite.com/unsafe/fit-in/x320/filters:format(webp)/s.eslite.com/b2b/newItem/2024/07/18/155_154421507_258_mainCoverImage1.jpg",
  },
  {
    id: 12,
    title: "全知讀者視角 12",
    author: "sing N song",
    publisher: "深空出版",
    price: 450,
    image: "https://s2.eslite.com/unsafe/fit-in/x320/filters:format(webp)/s.eslite.com/b2b/newItem/2024/07/18/155_154621245_515_mainCoverImage1.jpg",
  },
])
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
