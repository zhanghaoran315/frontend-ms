export const accountRules = {
  userName: [
    {
      required: true,
      message: '请输入账号',
      trigger: 'blur'
    },
    {
      pattern: /^[a-zA-Z0-9]{2,10}$/,
      message: '帐号为2-10位字母或数字',
      trigger: 'blur'
    }
  ],
  userPwd: [
    {
      required: true,
      message: '请输入密码',
      trigger: 'blur'
    },
    {
      pattern: /^[a-zA-Z0-9]{3,}$/,
      message: '密码为三位以上字母或数字',
      trigger: 'blur'
    }
  ]
}
