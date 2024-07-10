<template>
  <div id="PageHeader" class="page-header">
    <div id="HeaderLogo" class="logo">
      <img src="/image/logo.png"/>
    </div>
    <div class="title">RTT Web Demos</div>
    <div class="menu">
      <el-button class="setting-btn" :icon="Setting" size="large" @click="showConfigWindow">Setting</el-button>
      <el-button class="setting-btn" :icon="InfoFilled" size="large" @click="showAboutWindow">About</el-button>
    </div>
    <!-- <div class="title">Agora STT Web Demo</div> -->
    <!-- <div class="menu">
      <router-link v-for="(item) in menuItems" :to="item.url" key="item.url" class="menu-item">
        {{item.text}}
      </router-link>
    </div> -->
    <el-dialog title="Settings" v-model="dialogFormVisible" width="600px" :close-on-click-modal="false">
      <RealtimeConfig/>
    </el-dialog>
    <el-dialog title="About" v-model="showAbout" width="720px" :close-on-click-modal="true">
      <AboutView/>
    </el-dialog>
  </div>
</template>

<script setup lang="js">
import { ref } from 'vue'
import { Setting, InfoFilled } from '@element-plus/icons-vue'
import RealtimeConfig from '@/components/realtime/RealtimeConfig.vue'
import AboutView from '@/views/AboutView.vue';
import accountMgr from '@/components/manager/AccountManager'
import { accountStorage } from '@/components/manager/AccountManager.js'
const dialogFormVisible = ref(false)
const showAbout = ref(false)
function showConfigWindow() {
  dialogFormVisible.value = true
  accountMgr.currentAccount.value.id = 'pop'
  accountStorage.value.selfAccountId = 'pop'
  // roomConfig.userName += "a"
  //count.value++
}
function showAboutWindow() {
  console.log(`accountMgr.currentAccount is ${accountMgr.currentAccount.value.id}`)
  console.log(`selfAccountId.currentAccount is ${accountStorage.value.selfAccountId}`)
  showAbout.value = true
}
</script>

<style scoped lang="less">
@import '@/theme/header-footer.less';
.setting-button {
  background-color: gray;
  display: inline;
  margin: 0 1rem 0 0;
}
</style>
