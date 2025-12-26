<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useRoute } from "vue-router"
import axios from "axios"
import type CartItem from "../type/cartItem"

/* ========= 型別 ========= */
type PaymentMethod = "cash" | "credit_card"

interface Coupon {
  code: string
  discountType: "amount" | "percent"
  discountValue: number
}

interface RawCartItem {
  bookID: string
  name: string
  amount: number
  inventoryQuantity: number
  price: number
  images: { 
    imageId: string
    imageUrl: string
    displayOrder: number
    isCover: boolean
  }[]
  author: string
  publisher: string
}

/* ========= 狀態 ========= */
const route = useRoute()
const merchantID = ref(route.params.merchantID as string)
const cartItems = ref<CartItem[]>([])

onMounted(async () => {
  const token = localStorage.getItem('accessToken')
  if (!token) return

  const res = await axios.get<RawCartItem[]>(
    `http://localhost:3000/cart/${merchantID.value}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
  console.log("res", res.data)

// GET {{baseUrl}}/cart/{{merchantID}}
// Authorization: Bearer {{userToken}}

  cartItems.value = res.data.map(item => ({
      bookID: item.bookID,
      name: item.name,
      amount: item.amount,
      inventoryQuantity: item.inventoryQuantity,
      price: item.price,
      imageUrl:
        item.images?.find(img => img.isCover)?.imageUrl ??
        'http://localhost:3000/uploads/defaultImages/default_book_image.png',
      author: item.author,
      publisher: item.publisher
  }))
  console.log("cart item", cartItems.value)
})

// const cartItems = ref<CartItem[]>(
//   route.query.cart
//     ? JSON.parse(route.query.cart as string)
//     : []
// )
const couponInput = ref("")
const coupon = ref<Coupon | null>(null)
const couponError = ref("")
const paymentMethod = ref<PaymentMethod>("cash")
const shippingAddress = ref("") // <-- 新增地址欄位
const isSubmitting = ref(false)

/* ========= 計算金額 ========= */
const subtotal = computed(() =>
  cartItems.value.reduce(
    (sum: number, item: CartItem) => sum + (item.price * item.amount),
    0
  )
)

const discount = computed(() => {
  if (!coupon.value) return 0
  return coupon.value.discountType === "amount"
    ? coupon.value.discountValue
    : Math.floor(subtotal.value * coupon.value.discountValue / 100)
})

const shippingFee = computed(() => 60)

const total = computed(() =>
  Math.max(0, subtotal.value - discount.value + shippingFee.value)
)

/* ========= 優惠券 ========= */
function applyCoupon() {
  couponError.value = ""

  if (couponInput.value === "BOOK100") {
    coupon.value = {
      code: "BOOK100",
      discountType: "amount",
      discountValue: 100
    }
  } else if (couponInput.value === "SALE10") {
    coupon.value = {
      code: "SALE10",
      discountType: "percent",
      discountValue: 10
    }
  } else {
    coupon.value = null
    couponError.value = "無效的優惠碼"
  }
}

/* ========= 結帳 ========= */
async function checkout() {
  console.log("pay1", paymentMethod.value)
  if (cartItems.value.length === 0) {
    alert("請先新增商品到購物車中")
    return
  }

  if (!shippingAddress.value) {
    alert("請填寫收件地址")
    return
  }

  try {
    isSubmitting.value = true

    const paymentMethodNumber: number = (paymentMethod.value === "cash") ? 0 : 
                                ((paymentMethod.value === "credit_card") ? 1 : 2)

    console.log("payMN", paymentMethodNumber)
    if (paymentMethodNumber === 2) {
      alert("請選擇付款方式")
      return
    }

    const totalAmount = cartItems.value.reduce(
      (sum: number, item: CartItem) => sum + item.amount,
      0
    )

    const items = cartItems.value.map((item: CartItem) => ({
      bookId: item.bookID,
      amount: item.amount
    }))

    await axios.post(
      "http://localhost:3000/orders",
      {
        shippingAddress: shippingAddress.value,
        paymentMethod: paymentMethodNumber,
        totalPrice: total.value,
        totalAmount,
        items
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json"
        }
      }
    )

    await axios.delete(
      'http://localhost:3000/cart',
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    )
    
    cartItems.value = []
    alert("訂單建立成功！")
    
  } catch (e) {
    console.error(e)
    alert("結帳失敗，請稍後再試")
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="checkout-page">
    <h1 class="title">結帳</h1>

    <!-- 商品清單 -->
    <section class="card">
      <h2>購買商品</h2>
      <div
        v-for="item in cartItems"
        :key="item.bookID"
        class="item-row"
      >
        <span>{{ item.name }} × {{ item.amount }}</span>
        <span>NT$ {{ item.price * item.amount }}</span>
      </div>
    </section>

    <!-- 地址欄位 -->
    <section class="card">
      <h2>收件地址</h2>
      <input
        type="text"
        v-model="shippingAddress"
        placeholder="請輸入收件地址"
      />
    </section>

    <!-- 優惠券 -->
    <section class="card">
      <h2>優惠券</h2>
      <div class="coupon-row">
        <input
          v-model="couponInput"
          placeholder="輸入優惠碼"
        />
        <button @click="applyCoupon">套用</button>
      </div>
      <p v-if="coupon" class="success">
        已套用優惠券：{{ coupon.code }}
      </p>
      <p v-if="couponError" class="error">
        {{ couponError }}
      </p>
    </section>

    <!-- 付款方式 -->
    <section class="card">
      <h2>付款方式</h2>
      <label>
        <input type="radio" value="cash" v-model="paymentMethod" />
        貨到付款
      </label>
      <label>
        <input type="radio" value="credit_card" v-model="paymentMethod" />
        信用卡
      </label>
    </section>

    <!-- 訂單摘要 -->
    <section class="card summary">
      <div>商品小計：NT$ {{ subtotal }}</div>
      <div>折扣：-NT$ {{ discount }}</div>
      <div>運費：NT$ {{ shippingFee }}</div>
      <hr />
      <div class="total">應付金額：NT$ {{ total }}</div>
    </section>

    <!-- 確認結帳 -->
    <button
      class="checkout-btn"
      :disabled="isSubmitting"
      @click="checkout"
    >
      確認結帳
    </button>
  </main>
</template>

<style scoped>
.checkout-page {
  max-width: 720px;
  margin: 120px auto;
  padding: 0 16px;
}

.title {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 24px;
}

h2 {
  padding-bottom: 10px;
}

.card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 20px;
}

.card input[type="text"] {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border-radius: 6px;
  border: 1px solid var(--color-border);
}

.card label {
  color: var(--color-text-primary);
}

.item-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
}

.coupon-row {
  display: flex;
  gap: 8px;
}

.coupon-row input {
  flex: 1;
  padding: 8px;
}

.success {
  color: #16a34a;
}

.error {
  color: #dc2626;
}

.summary {
  font-size: 15px;
}

.total {
  font-size: 18px;
  font-weight: 700;
}

.checkout-btn {
  width: 100%;
  padding: 16px;
  font-size: 16px;
  font-weight: 700;
  border-radius: 14px;
  border: none;
  background: var(--color-accent);
  color: white;
  cursor: pointer;
}
</style>
