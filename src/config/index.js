/**
 * 环境配置
 */

const env = import.meta.env.DEV ? 'dev' : 'prod'

const envConfig = {
  dev: {
    baseUrl: '/api',
    mockApi:
      'https://console-mock.apipost.cn/mock/3dfed388-5916-45ed-9bf1-5eb26cdb9f66/'
  },
  prod: {
    baseUrl: '/api',
    mockApi: ''
  }
}

export default {
  env,
  mock: false,
  namespace: 'manager',
  ...envConfig[env]
}
