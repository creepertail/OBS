export interface Book {
  bookID: string
  ISBN: string
  name: string
  images: { 
    imageId: string
    imageUrl: string
    displayOrder: number
    isCover: boolean
  }[]
  status: number
  productDescription: string
  inventoryQuantity: number
  price: number
  author: string
  publisher: string
  merchantId: string
  createdAt: string
  updatedAt: string
}
