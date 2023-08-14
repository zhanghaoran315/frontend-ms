import HrRequest from './request'

import config from '@/config'

export default new HrRequest({
  baseURL: config.mockApi,
  timeout: 5000
})

export * from './login/index'
