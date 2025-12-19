interface Coupon {
  code: string
  discountType: "amount" | "percent"
  discountValue: number
}
