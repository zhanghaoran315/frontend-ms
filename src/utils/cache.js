class HrCache {
  constructor(isLocal = true) {
    this.storage = isLocal ? localStorage : sessionStorage
  }

  getItem(key) {
    const value = this.storage.getItem(key)
    if (value) return JSON.parse(value)
  }

  setItem(key, value) {
    if (value) {
      this.storage.setItem(key, JSON.stringify(value))
    }
  }

  removeItem(key) {
    this.storage.removeItem(key)
  }

  clear() {
    this.storage.clear()
  }
}

const localCache = new HrCache()
const sessionCache = new HrCache(false)

export { localCache, sessionCache }
