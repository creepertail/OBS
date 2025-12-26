<script setup lang="ts">
import axios from "axios";
import { ref } from "vue";
import { useRouter } from 'vue-router';

const router = useRouter();
const account = ref("");
const password = ref("");
const error = ref("");
const accessToken = ref("");

async function handleLogin() {
  try {
    const res = await axios.post("http://localhost:3000/members/login", {
      account: account.value,
      password: password.value
    });

    console.log("登入成功：", res.data);
    accessToken.value =res.data.access_token; 
    localStorage.setItem("accessToken", accessToken.value);
    localStorage.setItem("isLogin", "true");
    localStorage.setItem("account", account.value);
    
    const memberData = (await axios.get("http://localhost:3000/members/me", {
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      }
    })).data;
    localStorage.setItem("type", memberData.type);

    if (memberData.type === "user") {
      router.push({ name: 'home' }).then(() => {
        window.location.reload();
      });
    }
    else if (memberData.type === "merchant") {
      router.push({ name: 'merchant' }).then(() => {
        window.location.reload();
      });
    }
  } catch (err) {
    console.error("登入失敗：", err);
    error.value = err.response?.data?.message;
  }
}
</script>

<template>
  <div class="login-page">
    <form class="login-form" @submit.prevent="handleLogin">
      <h2 class="login-title">Welcome Back</h2>

      <div class="form-group">
        <label for="account">Account</label>
        <input
          id="account"
          type="text"
          v-model="account"
          placeholder="Enter your account"
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
        <div class="error" v-if="error" style="color:red">{{ error }}</div>
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
