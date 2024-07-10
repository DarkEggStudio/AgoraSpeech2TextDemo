<template>
  <div>
    <el-menu :router="true" @select="onMenuSelectec" :default-active="selectedIndex">
      <div class="menu-group-title">Real-Time transcription</div>
      <el-menu-item-group>
        <el-menu-item v-for="(el, index) in menuItems" :key="el.id" :index="el.id" :route="el.route">{{ el.text }}</el-menu-item>
      </el-menu-item-group>
    </el-menu>

    <!-- Conversation -->
    <el-drawer title="Conversation" v-model="displayResult">
      <div class="conversation-area">
        <div v-for='(item, idx) in subtitleList' :key="idx">
          <div v-if="item.text" class="subtitle-cell">
            <div class="user-name">{{ rtcMgr.allData[item.uid].name }} ({{ item.uid }}) {{ item.time != 0 ? new Date(parseInt(item.time)).toLocaleString() : 'N/A' }} </div>
            <div class="subtitle-text">{{ item.text }}</div>
            <div class="translation-text" v-for="(tran, index) in item.translation" :key="index">{{ tran }}</div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeMount } from 'vue'
const displayResult = ref(false)
let menuItems = [
  {'id': '1-1', 'text': 'RTC and Transcription', 'route': '/realtime'},
]
const selectedIndex = ref('1-1') // selected menu item index
function onMenuSelectec(a, b, c) {
  console.debug(displayOfflineMenu)
  console.debug(a)
  //console.debug(b)
  //console.debug(c)
}
const displayOfflineMenu = ref(import.meta.env.VITE_OFFLINE_MENU_ENABLED == 1)
</script>

<style scoped lang="less">
@import '@/theme/theme.less';
.menu-group-title {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  width: 100%;
  text-align: left;
  margin-top: 1.5rem;
}
.menu-item {
  display: block;
  text-align: left;
  line-height: 32px;
  margin: 10px 0px 10px 0px;
  padding: 0px 8px 0px 8px;
  background-color: #f0f0ff;
  height: 32px;
  font-size: 0.9rem;
  font-weight: 500;
}
</style>
