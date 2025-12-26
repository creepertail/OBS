<script setup lang="ts">
import axios from "axios";
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const accessToken = ref("");
const type = ref("");
const email = ref("");
const password = ref("");
const phoneNumber = ref("");
const name = ref("");
const address = ref("");
const error = ref("");

async function handleSetting() {
  accessToken.value = localStorage.getItem("accessToken") ?? "";
  type.value = localStorage.getItem("type") ?? "";

  try {
    const memberData = (await axios.get("http://localhost:3000/members/me", {
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      }
    })).data;

    const body = {};
    if (email.value) {
      body.email = email.value;
    }
    if (phoneNumber.value) {
      body.phoneNumber = phoneNumber.value;
    }
    if (password.value) {
      body.password = password.value;
    }
    if (name.value){
      if (memberData.type==="user"){
        body.userName = name.value;
      }
      else if (memberData.tytpe==="merchant"){
        body.merchantName = name.value;
      }
    }
    if (address.value){
      body.merchantAddress = address.value;
    }

    const res = await axios.patch(`http://localhost:3000/members/${memberData.memberID}`,
    body,
    {headers: {
        Authorization: `Bearer ${accessToken.value}`
      }
    });
    console.log(res.data);
  } catch (err) {
    console.error("變更失敗：", err);
    error.value = err.response?.data?.message;
  }

  alert("變更已完成!");
  router.push({ name: 'home' }).then(() => {
    window.location.reload();
  });
}
</script>

<template>
  <div class="setting-page">
    <form class="setting-form" @submit.prevent="handleSetting">
      <h2 class="setting-title">個人帳號設定</h2>

      <div class="form-row">
        <label for="email">Email</label>
        <input id="email" type="email" v-model="email" placeholder="Enter new email" />
        <div class="error" v-if="error.includes('Email')" style="color:red">{{ error }}</div>
      </div>

      <div class="form-row">
        <label for="password">Password</label>
        <input id="password" type="password" v-model="password" placeholder="Enter new password" />
        <div class="error" v-if="error.includes('Password')" style="color:red">{{ error }}</div>
      </div>

      <div class="form-row">
        <label for="phoneNumber">Phone number</label>
        <input id="phoneNumber" type="tel" v-model="phoneNumber" placeholder="Enter new phone number" />
        <div class="error" v-if="error.includes('Phone number')" style="color:red">{{ error }}</div>
      </div>

      <div class="form-row">
        <label for="name">Name</label>
        <input id="name" type="text" v-model="name" placeholder="Enter your new name" />
        <div class="error" v-if="error.includes('name')" style="color:red">{{ error }}</div>
      </div>

      <div class="form-row" v-if="type==='merchant'">
        <label for="address">Address</label>
        <input id="address" type="text" v-model="address" placeholder="Enter your new address" />
        <div class="error" v-if="error.includes('address')" style="color:red">{{ error }}</div>
      </div>

      <button type="submit" class="setting-button">Confirm</button>
    </form>
  </div>
</template>

<style scope>
.setting-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-family: "Inter", sans-serif;
  padding-top: 120px;
}

.setting-form {
  background-color: #ffffff;
  padding: 40px 32px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
}

.setting-title {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 24px;
  color: #333333;
}

.form-row {
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

.setting-button {
  background-color: #667eea;
  color: #ffffff;
  padding: 12px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.1s;
  margin: 4px 0;
}

.setting-button:hover {
  background-color: #5563d6;
  transform: translateY(-1px);
}

.setting-button:active {
  transform: translateY(0);
}
</style>