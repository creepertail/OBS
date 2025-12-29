import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import MerchantView from '../views/MerchantView.vue'
import CartView from '../views/CartView.vue'
import SettingView from '../views/SettingView.vue'
import SearchView from '../views/SearchView.vue'
import MerchantAddBookView from '../views/MerchantAddBookView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import MerchantEditBookView from '../views/MerchantEditBookView.vue'
import OrderListView from '@/views/OrderListView.vue'
import MerchantOrderListView from '@/views/MerchantOrderListView.vue'
import AdminView from '@/views/AdminView.vue'
import CouponView from '@/views/CouponView.vue'
import MerchantReportView from '@/views/MerchantReportView.vue'
import BookReviewsView from '@/views/BookReviewsView.vue'
import FavoriteView from '@/views/FavoriteView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/merchant',
      name: 'merchant',
      component: MerchantView,
    },
    {
      path: '/merchant/add',
      name: 'addProduct',
      component: MerchantAddBookView,
    },
    {
      path: '/merchant/edit/:bookID',
      name: 'editProduct',
      component: MerchantEditBookView,
    },
    {
      path: "/book/:bookID",
      name: "book",
      component: () => import("@/views/BookView.vue")
    },
    {
      path: "/reviews/book/:bookID",
      name: "bookReviews",
      component: BookReviewsView
    },
    {
      path: "/search/merchant/:merchantID",
      name: "searchMerchant",
      component: () => import("@/views/SearchMerchantView.vue")
    },
    {
      path: "/cart",
      name: "cart",
      component: CartView
    },
    {
      path: '/setting',
      name: 'setting',
      component: SettingView,
    },
    {
      path: '/search',
      name: 'search',
      component: SearchView,
    },
    {
      path: '/order/list',
      name: 'orderList',
      component: OrderListView
    },
    {
      path: '/merchant/order/list',
      name: 'merchantOrderList',
      component: MerchantOrderListView
    },
    {
      path: '/merchant/report',
      name: 'merchantReport',
      component: MerchantReportView
    },
    {
      path: '/checkout/:merchantID',
      name: 'checkout',
      component: CheckoutView
    },
    {
      path: '/coupon',
      name: 'coupon',
      component: CouponView
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView
    },
    {
      path: '/favorite',
      name: 'favorite',
      component: FavoriteView
    }
  ]
})

export default router
