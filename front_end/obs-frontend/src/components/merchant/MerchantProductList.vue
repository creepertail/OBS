<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import MerchantProductCard from './MerchantProductCard.vue'

interface Product {
  id: number
  name: string
  price: number
  image: string
}

const products = ref<Product[]>([])

onMounted(async () => {
  const res = await axios.get<Product[]>("http://localhost:3000/merchant/products")
  products.value = res.data
})
</script>

<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <h2 class="text-2xl font-bold mb-4">商家商品列表</h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <MerchantProductCard
        v-for="item in products"
        :key="item.id"
        :product="item"
      />
    </div>
  </div>
</template>


<style scoped>
</style>
