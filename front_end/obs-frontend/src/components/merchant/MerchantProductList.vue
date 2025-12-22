<script setup lang="ts">
import MerchantProductCard from './MerchantProductCard.vue'

defineProps({
  products: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <div class="product-list">
    <MerchantProductCard
        v-for="product in products"
        :key="product.bookID"
        v-bind="product"
      />
  </div>
</template>


<style scoped>
.product-list {
  display: grid;

  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));

  gap: 20px;
  padding: 10px 0;
}
</style>
