import { createRouter, createWebHashHistory } from 'vue-router'
import { localCache } from '@/utils'
import request from '@/api'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    name: 'login',
    path: '/login',
    component: () => import('@/views/login/login.vue')
  },
  {
    name: 'home',
    path: '/home',
    meta: {
      title: '首页'
    },
    component: () => import('@/layout/layout.vue'),
    redirect: '/welcome',
    children: [
      {
        name: 'welcome',
        path: '/welcome',
        meta: {
          title: '欢迎体验Vue3全栈课程'
        },
        component: () => import('@/layout/welcome/welcome.vue')
      }
    ]
  },
  {
    name: '404',
    path: '/404',
    component: () => import('@/views/not-found/not-found.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

const generateRoute = (menuList, routes = []) => {
  for (const menu of menuList) {
    if (menu.children && !menu.action) {
      generateRoute(menu.children, routes)
    } else if (menu.action) {
      routes.push({
        name: menu.component,
        path: menu.path,
        meta: {
          title: menu.menuName
        },
        component: menu.component
      })
    }
  }
  return routes
}

export const loadRoutes = () => {
  const cpns = import.meta.glob('@/views/**/*.vue')
  const map = {}

  for (const key in cpns) {
    // const routeName = key.split('.vue')[0].split('/').at(-1)
    const routeName = key.split('.vue')[0].split('/').pop()
    map[routeName] = cpns[key]
  }

  const userInfo = localCache.getItem('userInfo') || {}
  if (userInfo.token) {
    const menuList = localCache.getItem('userMenus')
    if (!menuList) return
    const routes = generateRoute(menuList)
    routes.forEach((route) => {
      route.component = map[route.name]
      router.addRoute('home', route)
    })
  }
}

// 导航守卫
router.beforeEach((to) => {
  if (router.hasRoute(to.name)) {
    document.title = to.meta.title
    return
  } else {
    document.title = 'Not Found'
    return '/404'
  }
})

export default router
