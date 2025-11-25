import { defineStore } from "pinia";

export interface Member {
  accessToken: string;
  memberID: string;
  email: string;
  account: string;
  phoneNumber: string;
  type: string;
  userName: string;
  userLevel: Int16Array;
  userState: Int16Array;
  merchantName: string;
  merchantState: Int16Array;
  merchantAddress: string;
  merchantSubscriberCount: Int16Array;
  createdAt: string;
  updatedAt: string;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isLogin: false,
    user: null as Member | null
  }),
  actions: {
    login(userData: Member) {
      this.isLogin = true;
      this.user = userData;
    },
    logout() {
      this.isLogin = false;
      this.user = null;
    }
  }
});