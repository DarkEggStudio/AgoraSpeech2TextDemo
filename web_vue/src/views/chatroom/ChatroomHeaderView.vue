<template>
  <div class="chatroom-header">
    <el-row>
      <el-col :span="12">
        <div class="room-title">Channel: {{ roomConfig.channelName }}, uid : {{ rtcMgr.uid }}, name: {{roomConfig.userName}} : {{ tempCls.name }}</div>
        <div class="room-info">RTT Lanaguage(s): {{ sttConfig.transcriptions.join(', ') }}</div>
        <div v-if="sttConfig.transcriptions.length<=0" class="room-info">No translation</div>
        <div class="room-info" v-for="(obj, index) in sttConfig.transcriptions" :key="index">
          Translate {{ obj }} to {{ sttConfig.translations[obj].join(', ') }}
        </div>
      </el-col>
      <el-col :span="12">
        <el-button :icon="Setting" class="text-button" @click="showConfigWindow('onLanguageClick')">Language</el-button>
        <el-button :icon="Setting" class="text-button" @click="showConfigWindow('onCloudStorageClick')">Cloud Storage</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeMount, onBeforeUnmount } from 'vue'
import { Microphone, Mute, Setting, ChatLineSquare } from '@element-plus/icons-vue'
import rtcMgr from "@/components/manager/RtcManager.js"
import roomConfig from '@/components/manager/RoomConfig.js'
import sttConfig from '@/components/manager/SttConfig.js'
import { tempCls } from '@/components/manager/SubtitleManager'

const emit = defineEmits(['onLanguageClick', 'onCloudStorageClick'])

onMounted(() => {
  console.debug("[ChatRoom header] rtc uid: " + rtcMgr.uid)
})
function showConfigWindow(event) {
  emit(event)
}
</script>

<style scoped lang="less">
@import '@/theme/theme.less';
@import '@/theme/chatroom.less';
.chatroom-header {
  background-color: transparent;
}
</style>