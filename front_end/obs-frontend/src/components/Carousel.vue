<template>
  <div class="carousel">

    <!-- 圖片容器 -->
    <div class="carousel-track" :style="trackStyle">
      <div class="carousel-item" v-for="(img, index) in images" :key="index">
        <img :src="img" />
      </div>
    </div>

    <!-- 左右按鈕 -->
    <button class="prev" @click="prev">‹</button>
    <button class="next" @click="next">›</button>

    <!-- 小點點指示器 -->
    <div class="dots">
      <span 
        v-for="(img, index) in images"
        :key="index"
        :class="{ active: index === currentIndex }"
        @click="goTo(index)"
      ></span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

// 輪播圖片列表（可換成你的圖片）
const images = [
  "https://static.eslite.com/unsafe/gs.eslite.com/index_slot/202511/ac95cd1e-6310-4157-a64f-53daa93e4008.jpg",
  "https://static.eslite.com/unsafe/gs.eslite.com/index_slot/202511/cc110075-6d98-4bff-9e0a-830efbb48d6c.jpg",
  // "https://www.ntut.edu.tw/var/file/7/1007/randimg/mobileadv_3973_5062299_87901.jpg",
  // "https://www.ntut.edu.tw/var/file/7/1007/randimg/mobileadv_3917_9027893_74268.jpg"
];

const currentIndex = ref(0);
let timer = null;

// 計算 CSS transform
const trackStyle = computed(() => ({
  transform: `translateX(-${currentIndex.value * 100}%)`,
  transition: "transform 0.5s ease"
}));

// 自動輪播
const startAutoPlay = () => {
  timer = setInterval(() => {
    next();
  }, 3000);
};

const stopAutoPlay = () => {
  if (timer) clearInterval(timer);
};

const next = () => {
  currentIndex.value = (currentIndex.value + 1) % images.length;
};

const prev = () => {
  currentIndex.value =
    (currentIndex.value - 1 + images.length) % images.length;
};

const goTo = (index) => {
  currentIndex.value = index;
};

onMounted(startAutoPlay);
onUnmounted(stopAutoPlay);
</script>

<style scoped>
.carousel {
  position: relative;
  width: 100%;
  max-width: 40%;
  aspect-ratio: 16 / 9;
  margin: auto;
  overflow: hidden;
  border-radius: 12px;
}

/* 影片/圖片容器（水平排列） */
.carousel-track {
  display: flex;
  width: 100%;
  height: 100%;
}

/* 每張圖片 */
.carousel-item {
  min-width: 100%;
  height: 100%;
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 左右切換按鈕 */
.prev,
.next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.4);
  border: none;
  color: white;
  font-size: 28px;
  padding: 8px 14px;
  border-radius: 50%;
  cursor: pointer;
}

.prev { left: 10px; }
.next { right: 10px; }

.prev:hover,
.next:hover {
  background: rgba(0,0,0,0.6);
}

/* 底部小圓點 */
.dots {
  position: absolute;
  bottom: 10px;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.dots span {
  width: 10px;
  height: 10px;
  background: #ddd;
  border-radius: 50%;
  cursor: pointer;
}

.dots .active {
  background: #666;
}
</style>
