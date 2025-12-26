<script setup lang="ts">
import { RouterLink, RouterView, useRoute, useRouter  } from 'vue-router'
import { computed } from 'vue'
import { ref, onMounted, onBeforeUnmount } from 'vue';
import SearchBox from './components/SearchBox.vue';

const isMerchant = computed(() => localStorage.getItem("type") === "merchant");
const router = useRouter();
const route = useRoute()
const hideLayout = computed(() => route.meta.hideLayout)
const isLogin = computed(() => localStorage.getItem("isLogin") === "true");
const account = computed(() => localStorage.getItem("account"));
const isOpen = ref(false);
const profileButton = ref<HTMLElement | null>(null);

function logout() {
  localStorage.clear();
  router.push({ name: 'home' }).then(() => {
    window.location.reload();
  });
}

function handleOutsideClick(event: MouseEvent) {
  if (profileButton.value && !profileButton.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleOutsideClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleOutsideClick);
});
</script>

<template>
  <header v-if="!hideLayout">
    <RouterLink :to="{name: 'home'}" class="homeButton">
      <img alt="OBS logo" class="logo" src="@/assets/logo2.png" width="80" height="80" />
      <h1 class="shopname">Online Bookstore System</h1>
    </RouterLink>

    <div class="routerButtons">
      <SearchBox></SearchBox>
      <RouterLink :to="{name: 'login'}" v-if="!isLogin">Login</RouterLink>
      <RouterLink :to="{name: 'register'}" v-if="!isLogin">Register</RouterLink>
      <RouterLink :to="{name: 'cart'}" v-if="isLogin">
        <i class="pi pi-spin pi-shopping-cart" style="font-size: 2rem" v-if="!isMerchant"></i>
      </RouterLink>
      <RouterLink :to="{name: 'orderList'}" v-if="isLogin">
        <i class="pi pi-spin pi-clipboard" style="font-size: 2rem" v-if="!isMerchant"></i>
      </RouterLink>
      <div class="profile-container" v-if="isLogin" ref="profileButton">
        <button class="account textButton" @click="isOpen=!isOpen">{{ account }}</button>
        <div class="profile-view" v-if="isOpen">
          <button class="textButton" @click="router.push({ name: 'merchant' })" v-if="isMerchant">我的商品</button>
          <button class="textButton" @click="router.push({ name: 'coupon' })">我的優惠券</button>
          <button class="textButton" @click="router.push({ name: 'setting' })">設置</button>
          <button class="textButton" @click="logout">登出</button>
        </div>
      </div>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  position: fixed;
  display: flex;
  gap: 2rem;
  align-items: center;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  line-height: 1.5;
  max-height: 15vh;
  background-color: gray;
}

.homeButton {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.homeButton:hover,
.homeButton:focus,
.homeButton:active {
  background-color: transparent;
}

.routerButtons{
  display: flex;
  align-items: center;
  margin: auto 2rem auto auto;
  gap: 1rem;
  font-size: 1.8em;
  text-decoration: none;
}

.routerButtons a {
  background-color: transparent;
}

.logo {
  display: block;
  margin: auto 0 auto 2rem;
}

.shopname {
  font-size: 2em;
}
.account {
  color: hsla(160, 100%, 37%, 1);
}

.textButton {
  background: none;
  border: none;
  padding: 0;
  margin: 0 5px;
  font: inherit;
  cursor: pointer;
}

.profile-view {
  display: flex;
  flex-direction: column;
  padding: 10px 16px;
  position: absolute;
  border-radius: 8px;
  box-shadow: 0 0 8px black;
  background-color: var(--color-bg-card);
  z-index: 1000;
  right: 5px;
}

.profile-view .textButton {
  width: 100%;
  padding: 10px 16px;

  text-align: left;
  font-size: 20px;

  color: var(--color-text-primary);
  border-radius: 8px;
}

.profile-view .textButton:hover {
  background-color: var(--color-border-hover);
}

</style>
