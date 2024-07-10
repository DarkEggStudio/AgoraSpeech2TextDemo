<template>
  <div class="main-content">
    <!-- <el-button class="setting-btn" :icon="Setting" circle @click="showSetting" /> -->
    <div class="real-time-panel">
      <div class="lang-title">Channel Config</div>
      <el-form ref="roomForm" :model="roomConfig" label-width="150px" :rules="rules">
        <el-form-item label="User Name:" prop="userName">
          <el-input v-model="roomConfig.userName" placeholder="Enter Your Name" size="large"
            @input="(val) => {(roomConfig.userName = roomConfig.userName.toUpperCase())}" />
        </el-form-item>
        <el-form-item label="Channel Name:" prop="channelName">
          <el-input v-model="roomConfig.channelName" placeholder="Enter Room Name" suffix-icon="el-icon-s-home" size="large"
            @input="(val) => (roomConfig.channelName = roomConfig.channelName.toUpperCase())" />
        </el-form-item>
        <!-- <div class="lang-title">RTT Config</div>
        <el-form-item label="Language:" prop="cultures">
          <el-autocomplete v-model="roomConfig.cultures" class="inline-input drop-down" size="large" :clearable="true" placeholder="Enter Languages"
            :fetch-suggestions="querySearch" 
            :trigger-on-focus="true" @select="handleLanguageSelect" @change="handleLanguageChanged">
          </el-autocomplete>
        </el-form-item>
        <div v-if="sttConfig.transcriptions.length > 0" class="lang-title">Translate Config</div>
        <el-form-item v-for="(item, index) in sttConfig.transcriptions" :label="tanslateItemTitle(item)" prop="translateTo" :key="index">
          <el-autocomplete v-model="translationStrings[item]" class="inline-input drop-down" size="large" :clearable="true" placeholder="Enter Translate Languages"
            :fetch-suggestions="querySearch"
            :trigger-on-focus="true"
            @select="((trans) => {handleTranslationSelect(item, trans)})"
            @change="((trans) => {handleTranslationChanged(item, trans)})">
          </el-autocomplete>
        </el-form-item> -->
        <el-form-item label="Join As:">
          <el-radio-group v-model="roomConfig.role">
            <el-radio label="host" style="margin-left: 0rem;">Host</el-radio>
            <el-radio label="guest" style="margin-left: 0rem;">Guest</el-radio>
            <el-radio label="audience" style="margin-left: 0rem;">Audience</el-radio>
          </el-radio-group>
        </el-form-item>
        <div>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-button type="primary" style="width:100%" size="large" @click="onSubmit" :icon="Microphone">JOIN AUDIO</el-button>
            </el-col>
            <el-col :span="12" >
              <el-button type="primary" style="width:100%" size="large" @click="openVideoChatroom" :icon="Microphone">JOIN VIDEO</el-button>
            </el-col>
          </el-row>
        </div>
      </el-form>
      <div class="config-log">
        Rtt Config:<br/>
        {{ sttConfig }}<br/>
        Room Config:<br/>
        {{ roomConfig }}
      </div>
    </div>
    <!-- Setting Dialog -->
    <el-dialog title="Settings" v-model="dialogFormVisible" width="400px" :close-on-click-modal="false">
      <RealtimeConfig/>
      <!-- <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="logRoomConfig(); dialogFormVisible = false">Confirm</el-button>
      </div> -->
    </el-dialog>
  </div>
</template>

<script setup lang="js">
import { ref, onMounted } from 'vue'
import { Microphone } from '@element-plus/icons-vue'
import router from "@/router"
import roomConfig from '@/components/manager/RoomConfig.js'
import sttConfig from '@/components/manager/SttConfig.js'
import RealtimeConfig from '@/components/realtime/RealtimeConfig.vue'

let rules = {
  channelName: [{ required: true, message: 'roomName is required', trigger: 'blur' }],
  userName: [{ required: true, message: 'userName is required', trigger: 'blur' }]
}
const dialogFormVisible = ref(false)
const roomForm = ref(null)
// const tempText = ref("")
// life cycle
onMounted(() => {
  console.debug(`Room Config: ${roomConfig}`)
})
const onSubmit = (() => {
  roomForm.value.validate((valid) => {
    if (valid) {
      router.push('/chatroom')
    } else {
      return false
    }
  })
})
function openVideoChatroom() {
  roomForm.value.validate((valid) => {
    if (valid) {
      roomConfig.value.type = 'video'
      console.debug(`Open video chatroom.`)
      router.push('/video-chatroom')
    } else {
      return false
    }
  })
}
</script>

<style scoped lang="less">
@import '../../theme/base.less';
@import '../../theme/theme.less';
.drop-down {
  width: 100%;
}
.real-time-panel {
  margin: auto;
  margin-top: 50px;
  box-sizing: border-box;
  // background-color: #555;
  width: 100%;
}
.enterance-div {
  margin: auto;
  width: 95%;
}
div.lang-title {
  width: 90%;
  line-height: 1.5rem;
  text-align: left;
  font-weight: 600;
  font-size: @font-size-normal;
  color: @text-color;
  margin: 0 0 1rem 0;
}
.config-log {
  margin: auto;
  margin: 10px;
  width: 100%;
  padding: 1rem;
  color: #ccc;
  box-sizing: border-box;
  text-align: left;

  &-hidden {
    display: none;
  }
}
</style>