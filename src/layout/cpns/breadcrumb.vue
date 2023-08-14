<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const breadcrumb = computed(() => {
  const route = useRoute()
  return route.matched
})
</script>

<template>
  <div class="breadcrumb">
    <el-breadcrumb separator-icon="ArrowRight">
      <el-breadcrumb-item v-for="(item, index) in breadcrumb" :key="item.path">
        <router-link to="/welcome" v-if="index == 0">{{
          item.meta.title
        }}</router-link>
        <span v-else>{{ item.meta.title }}</span>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<style scoped lang="less"></style>
