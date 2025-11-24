<!-- <script setup lang="ts">
import Login from '@/components/Login.vue';

</script> -->

<script setup lang="ts">
import axios from "axios";
import { ref } from "vue";
import { useAuthStore} from "../stores/auth";
import type { Member } from "../stores/auth";


const auth = useAuthStore();
const account = ref("");
const password = ref("");

async function handleLogin() {
  try {
    const res = await axios.post("http://localhost:3000/members/login", {
      account: account.value,
      password: password.value
    });

    console.log("登入成功：", res.data);
    auth.isLogin = true;
    const userData: Member = res.data.member;
    userData.accessToken = res.data.accessToken;
    console.log(userData);
    console.log("access token", userData.accessToken);
    console.log("id", userData.memberID);
    console.log("email", userData.email);
    console.log("account", userData.account);
    console.log("phone number", userData.phoneNumber);
    console.log("type", userData.type);
    console.log("user name", userData.userName);
    console.log("user level", userData.userLevel);
    console.log("user state", userData.userState);
    console.log("merchant name", userData.merchantName);
    console.log("merchant state", userData.merchantState);
    console.log("merchant subscriber count", userData.merchantSubscriberCount);
    console.log("create at", userData.createdAt);
    console.log("update at", userData.updatedAt);
    console.log(auth.isLogin);
  } catch (err) {
    console.error("登入失敗：", err);
  }
}
</script>

<!-- <template>
  <div class="login">
    <form @submit.prevent="handleLogin">
      <fieldset class="fieldset">
        <label class="label" for="username">Username</label>
        <input id="username" type="username" v-model="account" placeholder="Username">
        <br>
        <label class="label">Password</label>
        <input id="password" type="password" v-model="password" class="input w-full" placeholder="Password" autocomplete="current-password">
        <div class="flex justify-end mt-2">
          <a class="underline" href="/forget-password">Forgot password?</a>
        </div>
        <button class="btn btn-primary mt-8">Login</button>
        
      </fieldset><input type="submit" hidden="">
    </form>
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
</style> -->

<template>
  <div class="login-page">
    <form class="login-form" @submit.prevent="handleLogin">
      <h2 class="login-title">Welcome Back</h2>

      <div class="form-group">
        <label for="username">Username</label>
        <input
          id="username"
          type="text"
          v-model="account"
          placeholder="Enter your username"
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          type="password"
          v-model="password"
          placeholder="Enter your password"
          autocomplete="current-password"
        />
      </div>

      <div class="form-footer">
        <a href="/forget-password">Forgot password?</a>
      </div>

      <button type="submit" class="login-button">Login</button>
    </form>
  </div>
</template>

<style scoped>
/* 背景頁面置中 + 漸層背景 */
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  /* background: linear-gradient(135deg, #667eea, #764ba2); */
  font-family: "Inter", sans-serif;
}

/* 登入表單容器 */
.login-form {
  background-color: #ffffff;
  padding: 40px 32px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
}

/* 標題 */
.login-title {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 24px;
  color: #333333;
}

/* 表單項目 */
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

label {
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #555555;
}

input {
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #cccccc;
  font-size: 14px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

/* 表單底部文字 */
.form-footer {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;
}

.form-footer a {
  font-size: 13px;
  color: #667eea;
  text-decoration: underline;
}

/* 登入按鈕 */
.login-button {
  background-color: #667eea;
  color: #ffffff;
  padding: 12px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.1s;
}

.login-button:hover {
  background-color: #5563d6;
  transform: translateY(-1px);
}

.login-button:active {
  transform: translateY(0);
}
</style>
