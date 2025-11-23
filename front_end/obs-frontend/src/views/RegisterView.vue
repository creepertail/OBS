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
const pw = ref("");
const pw2 = ref("");
const error = ref("");

const checkPassword = (password: string, password2: string): boolean => {
  if (password !== password2){
    error.value = "密碼不一致";
    return false;
  }
  return true;
}

async function handleRegister() {
  pw.value = switchToUser.value ? userRef.value?.getPassword() ?? "" : merchantRef.value?.getPassword() ?? "";
  pw2.value = switchToUser.value ? userRef.value?.getPassword2() ?? "" : merchantRef.value?.getPassword2() ?? "";
  if (!checkPassword(pw.value, pw2.value)) {
    switchToUser.value ? userRef.value!.setError(error.value) : merchantRef.value!.setError(error.value);
    return;
  }
  else{
    error.value = "";
  }

  if (!checkPassword(pw.value, pw2.value)) {
    userRef.value!.setError(error.value);
    merchantRef.value!.setError(error.value);
    return;
  }
  else{
    error.value = "";
  }

  if (switchToUser.value) {
    successRegister.value = await userRef.value?.handleRegister() ?? false;
  }
  else {
    successRegister.value = await merchantRef.value?.handleRegister() ?? false;
  }

  if (successRegister.value) {
    router.push({ name: 'login' });
  }
}
</script>

<template>
  <main>
    <button @click="switchToUser = !switchToUser" class="switch-btn">
      切換至{{ switchToUser ? 'Merchant' : 'User' }}註冊
    </button>
    <UserRegister v-show="switchToUser" ref="userRef" />
    <MerchantRegister v-show="!switchToUser" ref="merchantRef" />
    <button @click="handleRegister" class="btn">Register</button>
  </main>
</template>

<style scoped>
.switch-btn {
  font-size: 1.2rem;
  width: 250px;
  height: 50px;
  background-color: forestgreen;
  color: white;
  border: none;
  border-radius: 16px;
  display: block;
  margin: 100px auto 0;
  cursor: pointer;
}

.switch-btn:hover {
  background-color: darkgreen;
}

.switch-btn {
  font-size: 1.2rem;
  width: 250px;
  height: 50px;
  background-color: forestgreen;
  color: white;
  border: none;
  border-radius: 16px;
  display: block;
  margin: 100px auto 0;
  cursor: pointer;
}

.switch-btn:hover {
  background-color: darkgreen;
}

.btn {
  font-size: 1.2rem;
  width: 250px;
  height: 50px;
  background-color: forestgreen;
  color: white;
  border: none;
  border-radius: 16px;
  display: block;
  margin: auto;
  cursor: pointer;
}

.btn:hover {
  background-color: darkgreen;
}
</style>