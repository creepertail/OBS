<script setup lang="ts">
import { RouterLink, RouterView, useRoute, useRouter  } from 'vue-router'
import { computed } from 'vue'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/solid'
import { ref, onMounted, onBeforeUnmount } from 'vue';

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
  console.log("mounted");
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleOutsideClick);
  console.log("unmounted");
});
</script>

<template>
  <header v-if="!hideLayout">
    <RouterLink :to="{name: 'home'}" class="homeButton">
      <img alt="OBS logo" class="logo" src="@/assets/logo2.png" width="80" height="80" />
      <h1>Online Bookstore System</h1>
    </RouterLink>

    <div class="routerButtons">
      <MagnifyingGlassIcon style="width:32px; height:32px; color:aliceblue;" />
      <RouterLink :to="{name: 'login'}" v-if="!isLogin">Login</RouterLink>
      <RouterLink :to="{name: 'register'}" v-if="!isLogin">Register</RouterLink>
      <div class="profile-container" v-if="isLogin" ref="profileButton">
        <button class="account textButton" @click="isOpen=!isOpen">{{ account }}</button>
        <div class="profile-view" v-if="isOpen">
          <button class="textButton">設置</button>
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

h1 {
  font-size: 2em;
}
.account {
  color: hsla(160, 100%, 37%, 1);
}

.textButton {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font: inherit;
  cursor: pointer;
}

.profile-view {
  display: flex;
  flex-direction: column;
  position: absolute;
  width: 100px;
  border: 1px solid gray;
  border-radius: 8px;
  box-shadow: 0 0 10px black;
  background-color: white;
  z-index: 1000;
  right: 5px;
}

.profile-view .textButton:hover {
  background-color: lightgray;
}
</style>
