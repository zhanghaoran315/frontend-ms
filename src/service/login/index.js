import hrRequest from '..'

// 账号登录
export function accountLogin(account) {
  return hrRequest.post({
    url: '/login',
    data: account
  })
}
