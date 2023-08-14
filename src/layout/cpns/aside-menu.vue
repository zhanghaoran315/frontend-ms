<script setup>
import AsideMenu from './aside-menu.vue'
const props = defineProps({
  menuList: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <div class="aside-menu">
    <template v-for="item in menuList" :key="item._id">
      <el-sub-menu
        v-if="
          item.children &&
          item.children.length > 0 &&
          item.children[0].menuType == 1
        "
        :index="item.path"
      >
        <template #title>
          <el-icon>
            <component v-if="item.icon" :is="item.icon"></component>
          </el-icon>
          <span>{{ item.menuName }}</span>
        </template>
        <aside-menu :menu-list="item.children" />
      </el-sub-menu>
      <el-menu-item v-else-if="item.menuType == 1" :index="item.path">{{
        item.menuName
      }}</el-menu-item>
    </template>
  </div>
</template>

<style lang="less">
/* 注意<style>标签中不要加scope，否则导致>还是无法隐藏 */
/*隐藏文字*/
.el-menu--collapse .el-sub-menu__title span {
  display: none;
}
/*隐藏 > */
.el-menu--collapse .el-sub-menu__title .el-sub-menu__icon-arrow {
  display: none;
}
</style>
