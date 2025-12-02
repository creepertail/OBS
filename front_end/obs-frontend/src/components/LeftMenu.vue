<template>
  <div>
    <!-- 左側選單 -->
    <aside class="left-menu" :class="{ closed: !isOpen }">
      <div class="category" v-for="(cat, index) in categories" :key="index">
        <div class="category-title" @click="toggleCategory(index)">
          {{ cat.name }}
        </div>

        <ul v-show="cat.open">
          <li class="category-text" v-for="item in cat.subs" :key="item">
            {{ item }}
          </li>
        </ul>
      </div>
    </aside>

    <!-- 控制按鈕 -->
    <button class="toggle-btn" @click="toggleMenu">
      <i :class="isOpen ? 'pi pi-angle-double-left' : 'pi pi-angle-double-right'"></i>
    </button>

  </div>
</template>

<script setup>
import { ref } from "vue";

// 整個側邊欄是否開啟
const isOpen = ref(true);

// 書籍分類
const categories = ref([
  { name: "文學", open: false, subs: ["小說", "散文", "詩集"] },
  { name: "科學", open: false, subs: ["物理", "化學", "生物"] },
  { name: "商業", open: false, subs: ["管理", "行銷", "會計"] },
]);

// 展開/收合分類
function toggleCategory(index) {
  categories.value[index].open = !categories.value[index].open;
}

// 展開/收合整個側欄
function toggleMenu() {
  isOpen.value = !isOpen.value;
}
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
