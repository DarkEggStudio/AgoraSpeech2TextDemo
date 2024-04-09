<template>
  <div id="app">
    <el-container>
      <el-header class="page-area page-area-header">
        <PageHeader/>
      </el-header>
      <el-container class="page-area page-area-body">
        <el-aside width="200px"><LeftMenu/></el-aside>
        <el-main>
          <el-row>
            <el-col :span="24" class="routeview-container">
              <router-view/>
            </el-col>
          </el-row>
        </el-main>
      </el-container>
      <el-footer class="page-area page-area-footer">
        <PageFooter/>
      </el-footer>
    </el-container>
    <!-- <router-view /> -->
  </div>
</template>

<script setup>
import PageHeader from '@/components/common/PageHeader.vue'
import PageFooter from '@/components/common/PageFooter.vue'
import LeftMenu from './views/LeftMenu.vue'
let logLv = import.meta.env.VITE_LOG_LEVEL
if (logLv == 1) {
  console.debug = function (){}
}
else if (logLv == 2) {
  console.debug = function (){}
  console.info = function (){}
}
</script>

<style scoped lang="less">
@import '@/theme/theme.less';
</style>
