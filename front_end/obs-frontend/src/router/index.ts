import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import HideView from '../views/HideView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import MerchantView from '../views/MerchantView.vue'
import BookView from '../views/BookView.vue'
import CartView from '../views/CartView.vue'
import SettingView from '../views/SettingView.vue'
import SearchView from '../views/SearchView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue'),
    // },
    // {
    //   path: '/hide',
    //   name: 'hide',
    //   component: HideView,
    //   meta: { hideLayout: true },
    // },
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
      path: "/book/:bookID",
      name: "book",
      component: () => import("@/views/BookView.vue")
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
    }
  ],
})

export default router
