<template>
  <div>
    <!-- 左側選單 -->
    <aside class="left-menu" :class="{ closed: !isOpen }">
      <div class="category" v-for="cat in categories" :key="cat.categoryID">
        <div class="category-title" @click="getBooksInCategory(cat.categoryID)">
          {{ cat.name }}
        </div>
      </div>
    </aside>

    <!-- 控制按鈕 -->
    <button class="toggle-btn" @click="toggleMenu">
      <i :class="isOpen ? 'pi pi-angle-double-left' : 'pi pi-angle-double-right'"></i>
    </button>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref } from "vue";
import { useRouter } from 'vue-router';

const router = useRouter();
const categories = ref([]);

// 整個側邊欄是否開啟
const isOpen = ref(true);

// 展開/收合整個側欄
function toggleMenu() {
  isOpen.value = !isOpen.value;
}

async function getAllCategories() {
  const res = await axios.get("http://localhost:3000/categories");
  categories.value = res.data;
  categories.value.sort((a, b) => a.categoryID - b.categoryID);
}

async function getBooksInCategory(id){
  router.push({ name: 'search', query: { cat: id } });
}

getAllCategories();
</script>

<style>
/* 左邊選單 */
.left-menu {
  position: fixed;
  top: 80px;
  left: 0;
  width: 250px;
  height: calc(100vh - 80px);
  background: lightgray;
  padding: 12px;
  box-sizing: border-box;
  transition: width 0.3s ease, padding 0.3s ease;
  overflow: hidden;
  z-index: 500;
}

/* 收起狀態 */
.left-menu.closed {
  width: 0;
  padding: 0;
  border: none;
}

/* 分類標題 */
.category-title {
  font-weight: bold;
  cursor: pointer;
  padding: 8px 0;
  color: black;
}

/* 子分類縮排 */
.category ul {
  padding-left: 20px;
  color: black;
}

/* 控制按鈕 */
.toggle-btn {
  position: fixed;
  top: 90px;
  left: 260px;
  z-index: 1000;
  padding: 8px 14px;
  cursor: pointer;
  background: #333;
  color: white;
  border: none;
  border-radius: 4px;
}

/* 左選單收起時，按鈕要跟著移動 */
.left-menu.closed + .toggle-btn {
  left: 10px;
}
</style>
