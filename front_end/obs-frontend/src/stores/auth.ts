import { defineStore } from "pinia";
interface User {
  id: string;
  email: string;
  account: string;
  phoneNumber: string;
  type: string;
  userName: string;
  userLevel: Int16Array;
  userState: Int16Array;
  merchantName: string;
  merchanState: Int16Array;
  merchantSubscriberCount: Int16Array;
  createdAt: string;
  updatedAt: string;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isLogin: false,
    user: null as User | null
  }),
  actions: {
    login(userData: User) {
      this.isLogin = true;
      this.user = userData;
    },
    logout() {
      this.isLogin = false;
      this.user = null;
    }
  }
});