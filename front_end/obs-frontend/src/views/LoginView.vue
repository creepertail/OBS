<!-- <script setup lang="ts">
import Login from '@/components/Login.vue';

</script> -->

<script setup lang="ts">
import axios from "axios";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";


const auth = useAuthStore();
const account = ref("");
const password = ref("");

async function handleLogin() {
  try {
    const res = await axios.post("http://localhost:3000/members/login", {
      account: account.value,
      password: password.value,
    });

    console.log("登入成功：", res.data);
    auth.isLogin = true;
    console.log(auth.isLogin);
  } catch (err) {
    console.error("登入失敗：", err);
  }
}
</script>

<template>
  <div class="login">

    <!-- <ul>
      <li v-for="u in users" :key="u.id">{{ u.name }}</li>
    </ul> -->
    <button class="btn btn-primary mt-8" @click="handleLogin">Login</button>
        
    <form @submit.prevent="handleLogin">
      <fieldset class="fieldset">
        <label class="label" for="username">Username</label>
        <input id="username" type="username" v-model="account" placeholder="Username">
        <label class="label">Password</label>
        <input id="password" type="password" v-model="password" class="input w-full" placeholder="Password" autocomplete="current-password">
        <div class="flex justify-end mt-2">
          <a class="underline" href="/forget-password">Forgot password?</a>
        </div>
        <button class="btn btn-primary mt-8">Login</button>
        
      </fieldset><input type="submit" hidden="">
    </form>
    <!-- <h1>This is an login page</h1>
    <Login/> -->
  </div>
</template>

<style>
.login {
  display: flex;
  justify-content: center; 
  height: 400px;
  width: 384px;
  padding: 24px;
  background-color: gray;
}

form {
  display: flex;
  justify-content: center; 
}
</style>
