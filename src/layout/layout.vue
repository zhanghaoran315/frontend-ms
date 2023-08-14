<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useSystemStore } from '@/stores'
import { localCache } from '@/utils'
import { useRouter } from 'vue-router'
import request from '@/api'
import AsideMenu from './cpns/aside-menu.vue'
import Breadcrumb from './cpns/breadcrumb.vue'
import { loadRoutes } from '@/router'

const isFold = ref(false)

const systemStore = useSystemStore()
const { userInfo } = storeToRefs(systemStore)

const onIconClick = () => {
  isFold.value = !isFold.value
}

const router = useRouter()
const handleLogout = (key) => {
  if (key == 'email') return
  systemStore.setUserInfo({})
  localCache.removeItem('userInfo')
  router.push('/login')
}

const noticeCount = ref(0)
const menuList = ref([])
onMounted(() => {
  request.noticeCount().then((res) => {
    noticeCount.value = res
  })

  request.getPermissionList().then((res) => {
    const { menuList: permMenuList, actionList } = res
    menuList.value = permMenuList
    systemStore.setUserMenus(permMenuList)
    systemStore.setUserActions(actionList)
    loadRoutes()
  })
})

const defaultActive = ref(location.hash.slice(1))
</script>

<template>
  <div class="layout">
    <div :class="['layout-aside', isFold ? 'fold' : 'unfold']">
      <!-- 系统LOGO -->
      <div class="logo">
        <img src="@/assets/img/logo.svg" />
        <span>Manager</span>
      </div>
      <!-- 导航菜单 -->
      <el-menu
        background-color="#001529"
        text-color="#fff"
        :default-active="defaultActive"
        class="el-menu-vertical"
        :collapse="isFold"
        router
      >
        <aside-menu :menu-list="menuList"></aside-menu>
      </el-menu>
    </div>
    <div class="layout-main">
      <div class="main-header">
        <div class="header-left">
          <el-icon class="icon" size="28" @click="onIconClick">
            <component :is="isFold ? 'Expand' : 'Fold'"></component>
          </el-icon>
          <div class="breadcrumb">
            <breadcrumb></breadcrumb>
          </div>
        </div>
        <div class="header-right">
          <div class="user-info">
            <el-badge :is-dot="!!noticeCount" class="notice" type="danger">
              <el-icon size="18px"><Bell /></el-icon>
            </el-badge>
            <el-dropdown @command="handleLogout">
              <span class="user-link">
                {{ userInfo.userName }}
                <i class="el-icon--right"></i>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="email">系统地址</el-dropdown-item>
                  <el-dropdown-item command="logout">退出</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
      <div class="main-content">
        <div class="page-wrapper">
          <RouterView></RouterView>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.el-menu-vertical {
  height: calc(100vh - 50px);
  border-right: none;
  background-color: #0c2135;
}

.el-sub-menu {
  .el-menu-item {
    background-color: #0c2135;
  }
  &.is-active {
    background-color: #0a60bd;
  }
}

.layout {
  display: flex;
  height: 100%;

  .layout-aside {
    width: 200px;
    height: 100vh;
    background-color: #001529;
    color: #fff;
    overflow-x: hidden;
    overflow-y: auto;
    transition: width 0.5s;

    // 隐藏滚动条
    &::-webkit-scrollbar {
      display: none;
    }

    // 折叠
    &.fold {
      width: 64px;
    }
    // 展开
    &.unfold {
      width: 200px;
    }

    .logo {
      display: flex;
      align-items: center;
      font-size: 18px;
      height: 50px;
      img {
        margin: 0 16px;
        width: 32px;
        height: 32px;
      }
    }
  }

  .layout-main {
    height: 100%;
    overflow-y: auto;
    flex: 1;

    .main-header {
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #ddd;
      padding: 0 20px;

      .header-left {
        display: flex;
        align-items: center;

        .breadcrumb {
          margin-left: 15px;
        }
      }

      .header-right {
        .notice {
          margin-right: 15px;
          cursor: pointer;
        }

        .user-link {
          cursor: pointer;
          color: #409eff;
        }
      }
    }

    .main-content {
      height: calc(100% - 50px);
      padding: 20px;
      background-color: #eef0f3;

      .page-wrapper {
        height: 100%;
        border-radius: 10px;
        overflow: auto;
      }
    }
  }
}
</style>
