<script setup lang="ts">
import UserRegister from '../components/register/UserRegister.vue';
import MerchantRegister from '../components/register/MerchantRegister.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const userRef = ref<InstanceType<typeof UserRegister> | null>(null);
const merchantRef = ref<InstanceType<typeof MerchantRegister> | null>(null);
const router = useRouter();
const switchToUser = ref(true)
const successRegister = ref(false);

async function handleRegister() {
  if (switchToUser.value && userRef.value?.isPasswordConsist) {
    successRegister.value = await userRef.value?.handleRegister() ?? false;
  }
  else if (!switchToUser.value && merchantRef.value?.isPasswordConsist) {
    successRegister.value = await merchantRef.value?.handleRegister() ?? false;
  }

  if (successRegister.value) {
    console.log("註冊成功");
    router.push({ name: 'login' });
  }
  else {
    console.log("註冊失敗");
  }
}
</script>

<template>
  <div class="register-page">
    <form class="register-form" @submit.prevent="handleRegister">
      <UserRegister v-if="switchToUser" ref="userRef" />
      <MerchantRegister v-if="!switchToUser" ref="merchantRef" />
      <button type="submit" class="button">Register</button>
      <button type="button" @click="switchToUser = !switchToUser" class="button">
        切換至{{ switchToUser ? 'Merchant' : 'User' }}註冊
      </button>
    </form>
  </div>
</template>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-family: "Inter", sans-serif;
  padding-top: 120px;
}

.register-form {
  background-color: #ffffff;
  padding: 40px 32px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
}

.button {
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

.button:hover {
  background-color: #5563d6;
  transform: translateY(-1px);
}

.button:active {
  transform: translateY(0);
}
</style>