import type { Coupon } from "./coupon"

interface ClaimWithCoupon {
  claimID: string
  userID: string
  couponID: string
  claimedAt: string
  state: number
  usedAt: string | null
  coupon: Coupon
}