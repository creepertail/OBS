<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import axios from "axios"
import type CartItem from "../type/cartItem"
import type Coupon from "../type/coupon"
import type ClaimWithCoupon from "../type/claimWithCoupon"


/* ========= 型別 ========= */
type PaymentMethod = "cash" | "credit_card"

interface RawCartItem {
  bookID: string
  name: string
  quantity: number
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
const router = useRouter()

const merchantID = ref(route.params.merchantID as string)
const cartItems = ref<CartItem[]>([])

const myClaims = ref<ClaimWithCoupon[]>([])
const selectedClaim = ref<ClaimWithCoupon | null>(null)

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

  cartItems.value = res.data.map(item => ({
      bookID: item.bookID,
      name: item.name,
      quantity: item.quantity,
      inventoryQuantity: item.inventoryQuantity,
      price: item.price,
      imageUrl:
        item.images?.find(img => img.isCover)?.imageUrl ??
        'http://localhost:3000/uploads/defaultImages/default_book_image.png',
      author: item.author,
      publisher: item.publisher
  }))
  console.log("cart item", cartItems.value)

  // 載入我的優惠券
  const claimRes = await axios.get<ClaimWithCoupon[]>(
    "http://localhost:3000/claims/mine",
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  )

  // 只留下「尚未使用」的優惠券
  myClaims.value = claimRes.data.filter(c => c.state === 0)
})

const couponInput = ref("")
const coupon = ref<Coupon | null>(null)
const couponError = ref("")
const paymentMethod = ref<PaymentMethod>("cash")
const shippingAddress = ref("") // <-- 新增地址欄位
const isSubmitting = ref(false)

/* ========= 計算金額 ========= */
const subtotal = computed(() =>
  cartItems.value.reduce(
    (sum: number, item: CartItem) => sum + (item.price * item.quantity),
    0
  )
)

const discount = computed(() => {
  if (!selectedClaim.value) return 0

  const coupon = selectedClaim.value.coupon

  // percent
  if (coupon.discountType === 0) {
    return Math.floor(subtotal.value * (1 - coupon.discount))
  }

  // amount
  return coupon.discount
})

const shippingFee = computed(() => 60)

const total = computed(() =>
  Math.max(0, subtotal.value - discount.value + shippingFee.value)
)

/* ========= 優惠券 ========= */
function applyCoupon(claim : ClaimWithCoupon) {
  if (selectedClaim.value === claim){
    selectedClaim.value = null
  }
  else {
    selectedClaim.value = claim
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
      (sum: number, item: CartItem) => sum + item.quantity,
      0
    )

    const items = cartItems.value.map((item: CartItem) => ({
      bookId: item.bookID,
      quantity: item.quantity
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
      `http://localhost:3000/cart/merchant/${merchantID.value}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    )
    
    cartItems.value = []
    alert("訂單建立成功！")

    router.push({
      name: 'orderList'
    })
    
  } catch (e: any) {
    console.error(e)
    
    // 處理商家被限制銷售的情況
    if (e.response?.status === 403) {
      const message = e.response?.data?.message || ""
      if (message.includes("merchant") && message.includes("not allowed")) {
        alert("此商家目前無法銷售商品，請聯繫客服或選擇其他商家的商品")
      } else {
        alert("權限不足：" + message)
      }
    } else if (e.response?.status === 400) {
      alert("請求錯誤：" + (e.response?.data?.message || "資料格式不正確"))
    } else if (e.response?.status === 401) {
      alert("登入已過期，請重新登入")
      router.push({ name: 'login' })
    } else {
      alert("結帳失敗，請稍後再試")
    }
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
        <span>{{ item.name }} × {{ item.quantity }}</span>
        <span>NT$ {{ item.price * item.quantity }}</span>
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
      <h2>選擇優惠券</h2>

      <div v-if="myClaims.length === 0">
        目前沒有可用的優惠券
      </div>

      <div
        v-for="claim in myClaims"
        :key="claim.claimID"
        class="coupon-item"
        :class="{ active: selectedClaim?.claimID === claim.claimID }"
        @click="applyCoupon(claim)"
      >
        <div class="coupon-title">
          {{ claim.coupon.description }}
        </div>
        <div class="coupon-desc">
          {{ claim.coupon.discountType === 0
            ? `打 ${(claim.coupon.discount * 10).toFixed(1)} 折`
            : `折 NT$ ${claim.coupon.discount}` }}
        </div>
        <div class="coupon-date">
          有效期限：{{ claim.coupon.validDate.slice(0, 10) }}
        </div>
      </div>

      <p v-if="selectedClaim" class="success">
        已套用優惠券：{{ selectedClaim.coupon.description }}
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

.coupon-item {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 10px;
  cursor: pointer;
}

.coupon-item.active {
  border-color: var(--color-accent);
  background: rgba(0, 0, 0, 0.03);
}

.coupon-title {
  font-weight: 700;
}

.coupon-desc {
  font-size: 14px;
  margin-top: 4px;
}

.coupon-date {
  font-size: 12px;
  color: #666;
}
</style>
