<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter, useRoute  } from "vue-router";
import type { Book } from "../type/book"

const route = useRoute()
const bookID = route.params.bookID as string
const router = useRouter();
const files = ref<File[]>([]);
const urls = ref<string[]>([]);
let body = {};
const form = ref({
  name: "",
  author: "",
  publisher: "",
  isbn: "",
  price: 0,
  inventoryQuantity: 0,
  productDescription: "",
});

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!target.files?.length) return;

  files.value = Array.from(target.files);
  urls.value = files.value.map(file => URL.createObjectURL(file));
}

async function submit(status: number) {
  try {
    for (let i: number = 0; i < files.value.length; i++) {
      const formData = new FormData();
      formData.append('file', files.value[i]);
      const res = await axios.post(
        'http://localhost:3000/books/upload-image',
        formData
      );
      urls.value.push(res.data.url);
    }

    body = {
      "ISBN": form.value.isbn,
      "name": form.value.name,
      "status": 1,
      "productDescription": form.value.productDescription,
      "inventoryQuantity": form.value.inventoryQuantity,
      "price": form.value.price,
      "author": form.value.author,
      "publisher": form.value.publisher,
    };
    
    const imgs = [];
    for (let i = 0; i < urls.value.length; i++) {
      const url = urls.value[i];
      imgs.push({
        "imageUrl": url,
        "displayOrder": i,
        "isCover": i == 1 ? true : false
      })
    }
    body.images = imgs;
    body.status = status;

    await axios.patch(
      `http://localhost:3000/books/${bookID}`,
      body,
      {
        headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`
      }}
    )
    
    router.push({ name: 'merchant' });
  } catch (err) {
    console.error(err);
    alert("修改商品失敗");
  }
}

onMounted(async () => {
  try{
    const res = await axios.get<Book>(`http://localhost:3000/books/${bookID}`)
    form.value.name = res.data.name;
    form.value.author = res.data.author;
    form.value.publisher = res.data.publisher;
    form.value.isbn = res.data.ISBN;
    form.value.price = res.data.price;
    form.value.inventoryQuantity = res.data.inventoryQuantity;
    form.value.productDescription = res.data.productDescription;
    res.data.images.forEach(image => {
      urls.value.push(image.imageUrl);
    });
    console.log(res.data);
  } catch (err) {
    console.error(err)
  }
})
</script>

<template>
  <div class="edit-book-page" style="padding-top: 100px;">

    <h1>修改商品</h1>

    <div class="form-group">
      <label>商品圖片: </label>
      <input type="file" accept=".jpg" multiple @change="handleFileUpload" />

      <div class="image-preview" v-if="urls.length">
        <img v-for="(img, i) in urls" :src="img" :key="i" />
      </div>
    </div>

    <div class="form-group">
      <label>書名: </label>
      <input v-model="form.name" type="text" />
    </div>

    <div class="form-group">
      <label>作者: </label>
      <input v-model="form.author" type="text" />
    </div>

    <div class="form-group">
      <label>出版社: </label>
      <input v-model="form.publisher" type="text" />
    </div>

    <div class="form-group">
      <label>ISBN: </label>
      <input v-model="form.isbn" type="text" />
    </div>

    <div class="form-group">
      <label>價格: </label>
      <input v-model.number="form.price" type="number" />
    </div>

    <div class="form-group">
      <label>庫存數量: </label>
      <input v-model.number="form.inventoryQuantity" type="number" />
    </div>

    <div class="form-group">
      <label>商品描述: </label>
      <textarea v-model="form.productDescription"></textarea>
    </div>

    <button class="button" @click="submit(1)">上架</button>
    <button class="button" @click="submit(0)">下架</button>
  </div>
</template>

<style scoped>
.edit-book-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.image-preview {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.image-preview img {
  width: 120px;
  height: 160px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.button {
  background-color: #667eea;
  color: #ffffff;
  padding: 12px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  margin: 4px 4px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.1s;
}

.button:hover {
  background-color: #5563d6;
  transform: translateY(-1px);
}

.button:active {
  transform: translateY(0);
}
</style>
