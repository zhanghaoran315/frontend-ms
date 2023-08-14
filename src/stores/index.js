import { defineStore } from 'pinia'
import { localCache } from '@/utils'

export const useSystemStore = defineStore('system', {
  state() {
    return {
      userInfo: localCache.getItem('userInfo') || {},
      userMenus: [],
      userActions: [],
    }
  },
  actions: {
    setUserInfo(payload) {
      this.userInfo = payload
    },
    setUserMenus(payload) {
      localCache.setItem('userMenus', payload)
      this.userMenus = payload
    },
    setUserActions(payload) {
      localCache.setItem('userActions', payload)
      this.userActions = payload
    }
  }
})
