import axios from 'axios'
class HrRequest {
  constructor(config) {
    this.instance = axios.create(config)
    this.interceptor = config.interceptor

    // 实例的拦截器
    this.instance.interceptors.request.use(
      this.interceptor?.requestInterceptor,
      this.interceptor?.requestInterceptorCatch
    )
    this.instance.interceptors.response.use(
      this.interceptor?.responseIntercepter,
      this.interceptor?.responseIntercepterCatch
    )

    this.instance.interceptors.request.use(
      (config) => {
        // console.log('全局的请求拦截器-请求成功');
        return config
      },
      (error) => {
        console.log('全局的请求拦截器-请求失败')
        return error
      }
    )
    this.instance.interceptors.response.use(
      (res) => {
        // console.log('全局的响应拦截器-响应成功');
        return res.data
      },
      (error) => {
        // console.log('全局的响应拦截器-响应失败');
        return error
      }
    )
  }

  request(config) {
    return this.instance.request(config)
  }

  get(config) {
    return this.request({ ...config, method: 'GET' })
  }

  post(config) {
    return this.request({ ...config, method: 'POST' })
  }
}

export default HrRequest
