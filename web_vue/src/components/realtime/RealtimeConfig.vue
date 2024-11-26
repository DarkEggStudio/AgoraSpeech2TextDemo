<template>
  <div class="realtime-config-area">
    <el-tabs v-model="activeTab" type="card" class="tabs">
      <el-tab-pane label="RTC Config" name="rtc" class="tab-content">
        <el-form ref="form" :model="roomConfig" label-width="120px">
          dd
          <el-form-item label="App Id:">
            <el-input v-model="appId" placeholder="App Id"  size="large"/>
          </el-form-item>
          <el-form-item label="App Certificate:">
            <el-input v-model="appCert" placeholder="App Certificate"  size="large"/>
          </el-form-item>
          <el-button @click="makeRtcToken">Make RTC token</el-button>
          <hr/>
          <el-form-item label="AEC:">
            <el-radio-group v-model="roomConfig.AEC">
              <el-radio :label="true">Open</el-radio>
              <el-radio :label="false">Close</el-radio>
              <el-tooltip class="item" effect="dark" content="Acoustic Echo Cancellation" placement="right-start">
                <!-- <el-button :icon="InfoFilled" size="small" circle/> -->re
                <!-- <el-icon class="info-icon"><InfoFilled /></el-icon> -->
              </el-tooltip>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="AGC:">
            <el-radio-group v-model="roomConfig.AGC">
              <el-radio :label="true">Open</el-radio>
              <el-radio :label="false">Close</el-radio>
              <el-tooltip class="item" effect="dark" content="Audio Gain Control" placement="right-start">
                <el-button :icon="InfoFilled" size="small" circle/>
              </el-tooltip>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="ANS:">
            <el-radio-group v-model="roomConfig.ANS">
              <el-radio :label="true">Open</el-radio>
              <el-radio :label="false">Close</el-radio>
              <el-tooltip class="item" effect="dark" content="Automatic Noise Suppression" placement="right-start">
                <el-button :icon="InfoFilled" size="small" circle/>
              </el-tooltip>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="Language Config" name="languageConfig" class="tab-content">
        <LanguageConfigView/>
      </el-tab-pane>
      <el-tab-pane label="Cloud Storage Config" name="cloudRecording" class="tab-content">
        <CloudStorageConfigView/>
      </el-tab-pane>
    </el-tabs>
    <el-button @click="saveToCookie" v-if="false">Save to cookie</el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import roomConfig from '@/components/manager/RoomConfig.js'
import { InfoFilled } from '@element-plus/icons-vue'
import LanguageConfigView from '@/views/config/LanguageConfigView.vue'
import CloudStorageConfigView from '@/views/config/CloudStorageConfigView.vue'
import rtcMgr from '@/components/manager/RtcManager'
import cookieMgr from '../manager/CookieManager'
const appId = ref('')
const appCert = ref('')
const activeTab = ref("rtc")
//
function saveToCookie() {
  cookieMgr.saveToCookie('test', roomConfig.value)
}
async function makeRtcToken() {
  let rtcToken = await rtcMgr.getRtcToken('TryToken', '9999', 1)
  console.log(rtcToken)
}
</script>

<style scoped lang="less">
@import "@/theme/theme.less";
.realtime-config-area {
  width: 100%;
}
.setting-btn {
    position: absolute;
    top: 20px;
    right: 20px;
}
.info-icon {
  color: #aaa;
}
</style>
