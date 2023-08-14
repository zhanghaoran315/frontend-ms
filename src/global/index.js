import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import 'normalize.css'
import '@/assets/css/index.less'

import { localCache } from '@/utils'
import { useSystemStore } from '@/stores'

import { nextTick, toRef } from 'vue'
import { storeToRefs } from 'pinia'
// const { userActions } = toRef(useSystemStore())
import { loadRoutes } from '@/router'

// 注册 icon
function registerIcons(app) {
  for (const [name, cpn] of Object.entries(ElementPlusIconsVue)) {
    app.component(name, cpn)
  }
}

// 注册全局属性
// function registerProperties(app) {
//   app.config.globalProperties.$format = {
//     formatTime(value) {
//       return formatUTCString(value)
//     }
//   }
// }

// 出口
function register(app) {
  loadRoutes()
  registerIcons(app)
  // registerProperties(app)
  app.use(ElementPlus, { size: 'small' })

  app.directive('has', {
    beforeMount(el, bindings) {
      const value = bindings.value
      // const { userActions } = storeToRefs(useSystemStore())
      const userActions = localCache.getItem('userActions') || []
      const hasPermission = userActions.includes(value)
      if (!hasPermission) {
        el.style = 'display: none'
        nextTick(() => {
          el.parentNode.removeChild(el)
        })
      }
    }
  })
}

export default register
