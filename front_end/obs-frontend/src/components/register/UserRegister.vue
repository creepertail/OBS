<script setup lang="ts">
import { ref } from 'vue'
import axios from "axios";

const email = ref("");
const account = ref("");
const phoneNumber = ref("");
const password = ref("");
const password2 = ref("");
const userName = ref("");
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
            type: "user",
            userName: userName.value
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
    <div class="register">
        <h1>User Register</h1>

        <div class="form-row">
            <label for="account">Account:</label>
            <input id="account" type="text" v-model="account" placeholder="Enter account" />
            <div class="error" v-if="error.includes('Account')" style="color:red">{{ error }}</div>
        </div>

        <div class="form-row">
            <label for="email">Email:</label>
            <input id="email" type="email" v-model="email" placeholder="Enter email" />
            <div class="error" v-if="error.includes('Email')" style="color:red">{{ error }}</div>
        </div>

        <div class="form-row">
            <label for="password">Password:</label>
            <input id="password" type="password" v-model="password" placeholder="Enter password" />
            <div class="error" v-if="error.includes('Password')" style="color:red">{{ error }}</div>
        </div>

        <div class="form-row">
            <label for="password2">Confirm password:</label>
            <input id="password2" type="password" v-model="password2" placeholder="Enter password again" />
            <div class="error" v-if="error === '密碼不一致'" style="color:red">{{ error }}</div>
        </div>

        <div class="form-row">
            <label for="phoneNumber">Phone number:</label>
            <input id="phoneNumber" type="tel" v-model="phoneNumber" placeholder="Enter phone number" />
            <div class="error" v-if="error.includes('Phone number')" style="color:red">{{ error }}</div>
        </div>

        <div class="form-row">
            <label for="userName">User name:</label>
            <input id="userName" type="text" v-model="userName" placeholder="Enter user name" />
            <div class="error" v-if="error.includes('User name')" style="color:red">{{ error }}</div>
        </div>
    </div>
</template>

<style scoped>
h1 {
    margin: 0 auto;
}

.register {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 400px;
  width: 550px;
  padding: 24px;
  margin: 2rem auto;
  background-color: gray;
}

.form-row {
    display: flex;
    gap: 16px;
}
</style>