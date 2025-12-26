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
  contains: {
    bookId: string
    amount: number
  }[]
}
