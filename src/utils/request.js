import axios from 'axios'
import sysConfig from '@/config'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { localCache } from '@/utils'

// 创建axios实例
const service = axios.create({
  baseURL: sysConfig.baseUrl,
  timeout: 8000
})

service.interceptors.request.use(
  (config) => {
    const { token = '' } = localCache.getItem('userInfo') || {}
    config.headers.Authorization = `Bearer ${token}`
    // console.log('请求拦截的config', config)
    return config
  },
  (err) => {
    return err
  }
)

service.interceptors.response.use((res) => {
  const { code, msg, data } = res.data

  if (code === 200) {
    return data
  } else if (code === 50001) {
    ElMessage.error('Token认证失败，请重新登录')
    setTimeout(() => {
      router.push('/login')
    }, 1000)
    return Promise.reject('Token认证失败，请重新登录')
  } else {
    ElMessage.error('网络请求异常，请稍后重试')
    return Promise.reject('网络请求异常，请稍后重试')
  }
})

function request(options) {
  options.method = options.method || 'get'
  if (options.method.toLowerCase() === 'get') {
    options.params = options.data
  }

  let isMock = sysConfig.mock
  if (options.mock) {
    isMock = options.mock
  }

  if (sysConfig.env === 'prod') {
    service.defaults.baseURL = sysConfig.baseApi
  } else {
    service.defaults.baseURL = isMock ? sysConfig.mockApi : sysConfig.baseUrl
  }

  return service(options)
}

const arr = ['get', 'post', 'put', 'patch', 'delete']

arr.forEach((item) => {
  return (request[item] = (options) => {
    return request({
      method: item,
      ...options
    })
  })
})

export default request
