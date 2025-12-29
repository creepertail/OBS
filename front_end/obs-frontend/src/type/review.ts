import type { Member } from "./member"

export interface Review {
  userID: string
  bookID: string
  date: string        // yyyy-mm-dd
  stars: number       // 1 ~ 5
  description: string
  user: Member
}
