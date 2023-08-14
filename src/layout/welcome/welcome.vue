<template>
  <div class="welcome">
    <div class="content">
      <div class="sub-title">欢迎体验</div>
      <div class="title">通用后台管理系统</div>
      <div class="desc">
        - Vue3.0+ElementPlus+Node+MongoDB打造通用后台管理系统
      </div>
    </div>
    <div class="img"></div>
  </div>
</template>

<script>
export default {
  name: 'welcome'
}
</script>

<style lang="less" scoped>
.welcome {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: #fff;

  .content {
    position: relative;
    bottom: 0px;
    .sub-title {
      font-size: 30px;
      line-height: 42px;
      color: #333;
    }
    .title {
      font-size: 40px;
      line-height: 62px;
      color: #409eff;
    }
    .desc {
      text-align: right;
      font-size: 14px;
      color: #999;
    }
  }
  .img {
    margin-left: 105px;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background-image: url('@/assets/img/welcome.png');
    background-size: contain;
  }
}
</style>
