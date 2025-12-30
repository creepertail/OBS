<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
import { useRouter } from 'vue-router';

const router = useRouter();
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

const files = ref<File[]>([]);
const previewImages = ref<string[]>([]);

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!target.files?.length) return;

  files.value = Array.from(target.files);
  previewImages.value = files.value.map(file => URL.createObjectURL(file));
}

async function submit() {
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

    await axios.post(
      'http://localhost:3000/books',
      body,
      {
        headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`
      }}
    )
    
    router.push({ name: 'merchant' });
  } catch (err) {
    console.error(err);
    alert("新增商品失敗");
  }
}
</script>

<template>
  <div class="page-wrapper">
    <div class="add-book-card">
      <h1 class="page-title">新增商品</h1>

      <!-- 圖片上傳 -->
      <section class="section">
        <h2>商品圖片</h2>

        <label class="upload-box">
          <input type="file" accept=".jpg" multiple @change="handleFileUpload" />
          <span>點擊上傳圖片（可多張）</span>
        </label>

        <div class="image-preview" v-if="previewImages.length">
          <img
            v-for="(img, i) in previewImages"
            :src="img"
            :key="i"
            :class="{ cover: i === 1 }"
          />
        </div>
      </section>

      <!-- 商品資訊 -->
      <section class="section">
        <h2>商品資訊</h2>

        <div class="form-grid">
          <div class="form-group">
            <label>書名</label>
            <input v-model="form.name" type="text" />
          </div>

          <div class="form-group">
            <label>作者</label>
            <input v-model="form.author" type="text" />
          </div>

          <div class="form-group">
            <label>出版社</label>
            <input v-model="form.publisher" type="text" />
          </div>

          <div class="form-group">
            <label>ISBN</label>
            <input v-model="form.isbn" type="text" />
          </div>

          <div class="form-group">
            <label>價格</label>
            <input v-model.number="form.price" type="number" />
          </div>

          <div class="form-group">
            <label>庫存數量</label>
            <input v-model.number="form.inventoryQuantity" type="number" />
          </div>
        </div>

        <div class="form-group full">
          <label>商品描述</label>
          <textarea v-model="form.productDescription"></textarea>
        </div>
      </section>

      <!-- 送出 -->
      <button class="submit-btn" @click="submit">
        送出商品
      </button>
    </div>
  </div>
</template>


<style scoped>
.page-wrapper {
  min-height: 100vh;
  padding: 120px 16px 40px;
  background: linear-gradient(180deg, #f8fafc, #eef2ff);
}

.add-book-card {
  max-width: 820px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 18px;
  padding: 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 24px;
  text-align: center;
}

.section {
  margin-bottom: 32px;
}

.section h2 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
}

/* ===== 圖片上傳 ===== */

.upload-box {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  border: 2px dashed #c7d2fe;
  border-radius: 12px;
  cursor: pointer;
  color: #6366f1;
  font-weight: 600;
  transition: 0.2s;
}

.upload-box:hover {
  background: #eef2ff;
}

.upload-box input {
  display: none;
}

.image-preview {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.image-preview img {
  width: 120px;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid transparent;
  transition: 0.2s;
}

.image-preview img.cover {
  border-color: #6366f1;
}

/* ===== 表單 ===== */

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full {
  margin-top: 16px;
}

.form-group label {
  font-size: 13px;
  margin-bottom: 6px;
  color: #555;
}

.form-group input,
.form-group textarea {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 14px;
  transition: 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

/* ===== 按鈕 ===== */

.submit-btn {
  width: 100%;
  padding: 16px;
  border-radius: 14px;
  border: none;
  font-size: 16px;
  font-weight: 700;
  color: white;
  background: #667eea;
  cursor: pointer;
  transition: 0.25s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(102, 126, 234, 0.35);
}

</style>
