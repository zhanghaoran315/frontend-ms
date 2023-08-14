<script setup>
import { ref, reactive } from 'vue'
import { accountRules } from './config/accountRules'
import { ElMessage } from 'element-plus'
import { localCache } from '@/utils/index'
import { useSystemStore } from '@/stores'
import { useRouter } from 'vue-router'
import { loadRoutes } from '@/router'

import request from '@/api'

const account = reactive({
  userName: 'coderzhr',
  userPwd: '123456'
})

const accountRef = ref()

const systemStore = useSystemStore()

const router = useRouter()
const loginAction = () => {
  accountRef.value?.validate((valid) => {
    if (valid) {
      request
        .login({
          ...account
        })
        .then((res) => {
          // console.log(res)
          localCache.setItem('userInfo', res)
          loadRoutes()
          systemStore.setUserInfo(res)
          router.push('/welcome')
        })
    } else {
      ElMessage.error('Oops, 请您输入正确的格式后再操作~~.')
    }
  })
}
</script>

<template>
  <div class="login">
    <div class="login-panel">
      <h2 class="title">通用后台管理系统</h2>
      <div class="login-account">
        <el-form
          :model="account"
          :rules="accountRules"
          label-width="60"
          ref="accountRef"
          status-icon
          size="default"
        >
          <el-form-item label="账号" prop="userName">
            <el-input
              v-model="account.userName"
              placeholder="请输入账号"
              autocomplete="new-password"
            />
          </el-form-item>
          <el-form-item label="密码" prop="userPwd">
            <el-input
              v-model="account.userPwd"
              type="password"
              placeholder="请输入密码"
              show-password
              autocomplete="new-password"
            />
          </el-form-item>
        </el-form>
      </div>
      <el-button type="primary" class="login-btn" @click="loginAction"
        >立即登录</el-button
      >
    </div>
  </div>
</template>

<style scoped lang="less">
.login {
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  background-image: url('@/assets/img/login-bg.png');
}

.login-panel {
  width: 340px;
  margin-top: -120px;

  .title {
    text-align: center;
    margin-bottom: 15px;
    color: #ccc;
  }

  .login-account {
    padding: 20px;
    background-color: #fafafa;
    border-radius: 7px;
    margin-bottom: 15px;
    box-shadow: 0px 0px 10px 3px #c7c9cb4d;
  }

  .login-btn {
    width: 100%;
    height: 35px;
  }
}
</style>
