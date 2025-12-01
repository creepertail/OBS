<template>
  <div class="add-book-page" style="padding-top: 100px;">

    <h1>新增商品</h1>

    <!-- 商品封面圖片上傳 -->
    <div class="form-group">
      <label>商品圖片</label>
      <input type="file" multiple @change="handleFileUpload" />

      <!-- 圖片預覽 -->
      <div class="image-preview" v-if="previewImages.length">
        <img v-for="(img, i) in previewImages" :src="img" :key="i" />
      </div>
    </div>

    <!-- 書籍資訊 -->
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

    <div class="form-group">
      <label>商品描述</label>
      <textarea v-model="form.productDescription"></textarea>
    </div>

    <button @click="submit">送出商品</button>

  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";

// 商品表單資料
const form = ref({
  name: "",
  author: "",
  publisher: "",
  isbn: "",
  price: 0,
  inventoryQuantity: 0,
  productDescription: "",
});

// 上傳的圖片檔案
const files = ref<File[]>([]);
const previewImages = ref<string[]>([]);

// 處理圖片上傳（前端預覽）
function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!target.files?.length) return;

  files.value = Array.from(target.files);

  previewImages.value = files.value.map(file => URL.createObjectURL(file));
}

// 提交商品
async function submit() {
  try {
    const formData = new FormData();

    // 加入文字資料
    Object.entries(form.value).forEach(([key, val]) => {
      formData.append(key, String(val));
    });

    // 加入圖片
    files.value.forEach(file => {
      formData.append("images", file); // Nest.js 裡要用 @UploadedFiles()
    });

    // 呼叫後端 API
    const res = await axios.post(
      "http://localhost:3000/books",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    alert("商品新增成功！");
    console.log(res.data);

  } catch (err) {
    console.error(err);
    alert("新增商品失敗");
  }
}
</script>

<style scoped>
.add-book-page {
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
</style>
