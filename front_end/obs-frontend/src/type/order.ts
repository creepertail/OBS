import type { Book } from "./book"

interface Order {
  orderId: string
  shippingAddress: string
  paymentMethod: number
  totalPrice: number
  state: number
  totalAmount: number
  orderDate: string
  merchant: {
    memberID: string
    merchantName: string
    merchantAddress: string
  }
  couponId: string
  contains: {
    quantity: number
    book: Book
  }[]
}
