<script setup lang="ts">
import { RouterLink, RouterView, useRoute  } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const hideLayout = computed(() => route.meta.hideLayout)
const isLogin = computed(() => route.meta.isLogin)
</script>

<template>
  <header v-if="!hideLayout">
    <RouterLink :to="{name: 'home'}" class="homeButton">
      <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" /> <!-- TODO: change img -->
      <h1>Online Bookstore System</h1>
    </RouterLink>

    <div class="routerButtons">
      <RouterLink :to="{name: 'login'}" v-if="!isLogin">Login</RouterLink>
      <RouterLink :to="{name: 'register'}" v-if="!isLogin">Register</RouterLink>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  position: absolute;
  display: flex;
  gap: 2rem;
  align-items: center;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  line-height: 1.5;
  max-height: 20vh;
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
  font-size: 3em;
}

/* nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
} */

/* @media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
} */
</style>
