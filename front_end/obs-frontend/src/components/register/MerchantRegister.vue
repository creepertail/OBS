<script setup lang="ts">
import { ref } from 'vue'
import axios from "axios";

const email = ref("");
const account = ref("");
const phoneNumber = ref("");
const password = ref("");
const password2 = ref("");
const merchantName = ref("");
const merchantAddress = ref("");
const error = ref("");

const getPassword = () => password.value;
const getPassword2 = () => password2.value;
const setError = (errorMessage: string) => error.value = errorMessage;

async function handleRegister(): Promise<boolean> {
  try {
    const res = await axios.post("http://localhost:3000/members", {
      email: email.value,
      account: account.value,
      password: password.value,
      phoneNumber: phoneNumber.value,
      type: "merchant",
      merchantName: merchantName.value,
      merchantAddress: merchantAddress.value
    });
    return true;
  } catch (err) {
    error.value = err.response?.data?.message;
    return false;
  }
}

defineExpose({
  getPassword,
  getPassword2,
  handleRegister,
  setError,
});
</script>

<template>
  <h2 class="register-title">Merchant Register</h2>

  <div class="form-row">
    <label for="account">Account</label>
    <input id="account" type="text" v-model="account" placeholder="Enter account" />
    <div class="error" v-if="error.includes('Account')" style="color:red">{{ error }}</div>
  </div>

  <div class="form-row">
    <label for="email">Email</label>
    <input id="email" type="email" v-model="email" placeholder="Enter email" />
    <div class="error" v-if="error.includes('Email')" style="color:red">{{ error }}</div>
  </div>

  <div class="form-row">
    <label for="password">Password</label>
    <input id="password" type="password" v-model="password" placeholder="Enter password" />
    <div class="error" v-if="error.includes('Password')" style="color:red">{{ error }}</div>
  </div>

  <div class="form-row">
    <label for="password2">Confirm password</label>
    <input id="password2" type="password" v-model="password2" placeholder="Enter password again" />
    <div class="error" v-if="error === '密碼不一致'" style="color:red">{{ error }}</div>
  </div>

  <div class="form-row">
    <label for="phoneNumber">Phone number</label>
    <input id="phoneNumber" type="tel" v-model="phoneNumber" placeholder="Enter phone number" />
    <div class="error" v-if="error.includes('Phone number')" style="color:red">{{ error }}</div>
  </div>

  <div class="form-row">
    <label for="merchantName">Merchant name</label>
    <input id="merchantName" type="text" v-model="merchantName" placeholder="Enter merchant name" />
    <div class="error" v-if="error.includes('Merchant name')" style="color:red">{{ error }}</div>
  </div>

  <div class="form-row">
    <label for="merchantAddress">Merchant address</label>
    <input id="merchantAddress" type="text" v-model="merchantAddress" placeholder="Enter merchant address" />
    <div class="error" v-if="error.includes('Merchant address')" style="color:red">{{ error }}</div>
  </div>
</template>

<style scoped>
.register-title {
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
</style>