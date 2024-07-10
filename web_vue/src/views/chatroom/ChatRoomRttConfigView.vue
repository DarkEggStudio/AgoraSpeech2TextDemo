<template>
  <div class="room-button-list room-button-list-fixed" v-loading="loading">
    <div id="language-display-panel">
      <!-- Display language config-->
      <div class="btn-group-title">RTT States: {{ roomConfig.rttStarted ? 'Started' : 'Stopped' }}</div>
      <div v-if="roomConfig">
        <div v-for="langCode in sttConfig.transcriptions" :key="langCode">
          <div class="lang-title">
            Transcription:
          </div>
          <div class="lang-text">
            {{ languageName(langCode) }}
          </div>
          <div class="lang-title">
            Translate to:
          </div>
          <div class="lang-text">
            <div v-for="transCode in sttConfig.translations[langCode]" :key="transCode">
              {{ languageName(transCode) }}
            </div>
          </div>
          <hr/>
          <div class="lang-title">
            Offline Translate to:
          </div>
          <div class="lang-text">
            {{ offlineLanguageName(sttConfig.recLanguage) }}
          </div>
          <div class="lang-title">
            Offline Translation Format:
          </div>
          <div class="lang-text">
            {{ sttConfig.recFormat }}
          </div>
        </div>
      </div>
      <hr/>
    </div>
    <!-- Rtt start -->
    <div id="rtt-panel">
      <div v-if="roomConfig.role == 'host'" class="right-menu-content">
        <div class="lang-title btn-group-title">Transcription</div>
        <el-checkbox v-model="enableRtt" label="Realtime transcription" size="large" @change="(val) => {if(!val) {sttConfig.enableRec = false} }" :disabled="taskStarted" class="checkbox-main"/>
        <el-tooltip class="item" effect="dark" content="Enable/Disable Realtime transcription(RTT), the subtitle will display" placement="bottom-start">
          <el-icon class="info-icon"><InfoFilled /></el-icon>
        </el-tooltip>
        <el-checkbox v-model="sttConfig.enableRec" label="VTT Recording" size="large" :disabled="taskStarted||!enableRtt" class="checkbox-sub"/>
        <el-tooltip class="item" effect="dark" content="Record the realtime transcription as *.VTT* file to cloud storage" placement="bottom-start">
          <el-icon class="info-icon"><InfoFilled /></el-icon>
        </el-tooltip>
        <hr/>
        <el-checkbox v-model="enableCloudRec" label="Audio/Video Recording" size="large" @change="(val) => {if(!val) {cloudRecConfig.enableTranscription = false} }" :disabled="taskStarted" class="checkbox-main"/>
        <el-tooltip class="item" effect="dark" content="Enable cloud recording, will record *.m3u8* and *.ts* file to cloud storage" placement="bottom-start">
          <el-icon class="info-icon"><InfoFilled /></el-icon>
        </el-tooltip>
        <el-checkbox v-model="cloudRecConfig.enableTranscription" label="Offline Transcription" size="large" :disabled="taskStarted||!enableCloudRec" class="checkbox-sub"/>
        <el-tooltip class="item" effect="dark" content="Enable cloud recording with transcription, will save *txt* or *json* file to cloud storage" placement="bottom-start">
          <el-icon class="info-icon"><InfoFilled /></el-icon>
        </el-tooltip>
        <hr/>
        <el-button size="large" class="text-button" :disabled="startBtnState().disabled" :type="startBtnState().type" @click="toggleTask">
          {{ startBtnState().text }}
        </el-button>
      </div>
      <!-- <div v-if="!(roomConfig.type == 'video')"> -->
        <!-- <div class="right-menu-sub-title">Display translations</div>
        <el-switch v-model="sttConfig.showTranslation" size="large" active-text="ON" inactive-text="OFF"></el-switch>
      </div>
      <div v-else> -->
      <div>
        <div class="lang-title ">Display Translation Language</div>
        <div v-for="key in Object.keys(sttConfig.translations)" :key="key">
          <div class="trans-lang-title">{{languageName(key)}} to:</div>
          <div class="trans-lang-title">
            <el-checkbox-group v-model="roomConfig.displayTrans[key]" style="align: left;">
              <el-checkbox v-for="el in sttConfig.translations[key]" :key="el" :label="el" :value="el">{{languageName(el)}}</el-checkbox>
              <!-- <div v-for="key in Object.keys(sttConfig.translations)" :key="key"> -->
            </el-checkbox-group>
          </div>
        </div>
        <!-- <el-select v-model="roomConfig.displayLanguageCode" size="large">
          <el-option label="Live Caption" value="None"></el-option>
          <div v-for="key in Object.keys(sttConfig.translations)" :key="key">
            <el-option v-for="el in sttConfig.translations[key]" :key="el" :label="languageName(el)" :value="el"></el-option>
          </div>
        </el-select> -->
      </div>
      <!-- Buttons Config -->
      <div v-if="roomConfig.role == 'host'">
        <div v-if="props.showRecording">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-button size="large" class="text-button" v-show="true" :disabled="!rtcJoined" type="info" @click="showFullText">
                <font-awesome-icon :icon="['fas', 'comment-alt']" class="fa-icon"/>
                Transcription
              </el-button>
            </el-col>
            <el-col :span="12">
              <el-button size="large" class="text-button" v-show="true" :disabled="!rtcJoined" type="info" @click="showConversation">
                <!-- <font-awesome-icon :icon="['fas', 'comments']" class="fa-icon"/> -->
                <div style="display: block; width: 100%;">Conversation</div>
              </el-button>
            </el-col>
          </el-row>
        </div>
      </div>
      <hr/>
    </div>
    <!-- Leave Room -->
    <div id="leave-panel">
      <hr/>
      <el-button size="large" class="text-button" v-show="true" :disabled="!props.rtcJoined" type="danger" @click="exit">
        <font-awesome-icon :icon="['fas', 'sign-out-alt']" class="fa-icon"/>Leave Room
      </el-button>
    </div>
    <div class="room-debug-info">
      Self: [{{ channelInfo.selfUid }}] {{ channelInfo.selfUsername }}
      <div v-for="host in channelInfo.hosts" :key="host.userId">[{{ host.userId }}] {{ host.states.username }}</div>
      <div>RTT: {{ enableRtt }}</div>
      <div> > with recording: {{ sttConfig.enableRec }}</div>
      <div>Cloud Recording: {{ enableCloudRec }}</div>
      <div> > with Transcription: {{ cloudRecConfig.enableTranscription }}</div>
    </div>
    <!-- Full Transcription -->
    <el-drawer title="Transcription" v-model="displayFullText">
      <el-button @click="copyResultToAnalysis">Copy to AI Analysis</el-button>
      <div class="conversation-area">
        {{ fullText() }}
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeMount, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Microphone, Mute, Setting, ChatLineSquare, InfoFilled } from '@element-plus/icons-vue'
import roomConfig from '@/components/manager/RoomConfig.js'
import sttConfig from '@/components/manager/SttConfig.js'
import cloudRecConfig from "@/components/manager/CloudRecordingConfig.js"
import cloudRecMgr from '@/components/manager/CloudRecManager.js'
import sttApiManager from '@/components/manager/STTApiManager'
import langMgr from '@/components/manager/LanguageManager.js'
import rtmMgr from "@/components/manager/RtmManager.js"
import channelInfo from '@/components/manager/ChannelInfo.js'
import { tempCls } from '@/components/manager/SubtitleManager'
// props
let props = defineProps({
  showRecording: Boolean,
  rtcJoined: Boolean
  // selfUid: Number
})
//
const loading = ref(false)
// const rtcUidStr = ref('0')
const rttTokenName = ref('')
const rttTaskId = ref('')
let languageList = ref([])
const offlineLanguageList = ref([])
// flags
const enableRtt = ref(true)
// const enableRttRec = ref(false)
const enableCloudRec = ref(false)
// const enabaleCloudRecRtt = ref(false)
const taskStarted = ref(false)

// const cloudRecStarted = ref(false)
const displayFullText = ref(false)
//const displayLanguageCode = ref('None')
// event
const emit = defineEmits(['exitButtonClicked', 'showFullText', 'showConversation'])
// life cycle
onBeforeMount(() => {
  languageList.value = langMgr.languageList()
  offlineLanguageList.value = langMgr.offlineLangList()
})
onMounted(() => {
  console.debug(roomConfig.value)
  console.debug(sttConfig.value)
  console.debug(`showRecording: ${props.showRecording}`)
  console.debug(`rtcJoined: ${props.rtcJoined}`)
})
// ----------
// Service Task toggle
// ----------
function toggleTask() {
  if (taskStarted.value) {
    stopTask()
  }
  else {
    startTask()
  }
}
const startTask = (() => {
  console.debug('Start button clicked')
  loading.value = true
  if (enableRtt.value) {
    // clear subtitles
    //subtitles.value.splice(0)
    // check transcription 
    if ( sttConfig.value.transcriptions.length <= 0 ) {
      let msg = 'No transcription language. Can not start STT task.'
      console.warn(msg)
      ElMessageBox.alert(msg)
      loading.value = false
      return
    }
    // save channel
    if (sttApiManager.channel != roomConfig.value.channelName) {
      sttApiManager.tokenName = ""
      sttApiManager.channel = roomConfig.value.channelName
    }
    console.debug(sttApiManager.channel)
    console.debug(sttApiManager.tokenName)
    console.debug(sttApiManager.isOverdue())
    console.debug(roomConfig.value.channelName)
    // start rtt
    if (sttApiManager.isOverdue()) {
      // acquire token and start
      console.debug('Start RTT in channel ' + roomConfig.value.channelName)
      console.debug('RTT Config: ' + sttConfig.value.transcriptions + ':' + sttConfig.value.transcriptions.length)
      console.debug('RTT Config: ' + sttConfig.value.translations)
      sttApiManager.acquire(roomConfig.value.channelName, (success, tokenName) => {
        rttTokenName.value = tokenName
        sttApiManager.start(roomConfig.value.channelName, roomConfig.value.cultures, sttConfig.value, (success, taskIdorErrorMessage) => {
          updateUI(success, success, taskIdorErrorMessage)
          // send states through RTM
          let json = {
            state: 'started',
            transcriptions: sttConfig.value.transcriptions,
            translations: sttConfig.value.translations
          }
          const data = [{
            key: 'rttState',
            value: JSON.stringify(json)
          }]
          rtmMgr.updateChannelMetadata(roomConfig.value.channelName, data)
        })
      })
    }
    else {
      // use saved token to start
      sttApiManager.start(roomConfig.value.channelName, roomConfig.value.cultures, sttConfig.value, (success, taskIdorErrorMessage) => {
        self.updateUI(success, success, taskIdorErrorMessage)
      })
    }
  }

  // Cloud recording
  if ( enableCloudRec.value ) {
    console.debug(`Start Audio/Video cloud recording...`)
    cloudRecMgr.startRec([channelInfo.value.selfUid.toString()], cloudRecConfig.value.enableTranscription, (success, message) => {
      console.debug(`Start Cloud recording ${cloudRecConfig.value.enableTranscription?'with transcription':''} ${success?'success':'failed'}, error is ${message}`)
      updateUI(success, success, message)
    })
  }
  return
})
const stopTask = (() => {
  console.debug('Stop button clicked')
  loading.value = true
  sttApiManager.stop(rttTaskId.value, rttTokenName.value, (result, message) => {
    if ( result ) {
      let json = {
        state: 'stopped',
        transcriptions: sttConfig.value.transcriptions,
        translations: sttConfig.value.translations
      }
      const data = [{
        key: 'rttState',
        value: JSON.stringify(json)
      }]
      rtmMgr.updateChannelMetadata(roomConfig.value.channelName, data)
      updateUI(true, false, '')
    } else {
      updateUI(false, true, message)
    }
    loading.value = false
  })
  cloudRecMgr.stopRec(channelInfo.value.selfUid.toString(), (success, message) => {
    console.debug(`Stop Cloud recording ${cloudRecConfig.value.enableTranscription?'with transcription':''} ${success?'success':'failed'}, error is ${message}`)
    updateUI(success, success, message)
  })
})
//----------
// Update UI display
// And create auto stop timer
//----------
function updateUI(success, started, taskIdOrMessage) {
  taskStarted.value = started;
  if ( success ) {
    loading.value = false;
    rttTaskId.value = taskIdOrMessage;
    //this.sendStartSTTNotificationToPeers(true);
    // auto stop in 10 mins
    createSttAutoStopTimer(() => {
      if (rttTaskId.value != null && rttTaskId.value.length > 0) {
        console.debug('Auto stop STT at: ' + new Date())
        ElMessage({message: 'Auto stop STT.', type: 'message'})
        //this.$message.info('Auto stop STT')
        stopTask()
      }
    }, 10*60*1000)
  } else {
    taskStarted.value = false;
    loading.value = false;
    ElMessage({message: 'this is a message.', type: 'error'})
    //$message.error(taskIdOrMessage ? taskIdOrMessage : 'network anomaly')
  }
}
// sttBtnState
let startBtnState = () => {
  let ret = {}
  if ( !(enableRtt.value | sttConfig.value.enableRec | enableCloudRec.value | cloudRecConfig.value.enableTranscription) ) {
    ret['disabled'] = true
    ret['text'] = 'Start'
    ret['type'] = 'primary'
    return ret
  }
  if ( !taskStarted.value ) {
      ret['disabled'] = false
      ret['text'] = 'Start'
      ret['type'] = 'primary'
  } 
  else {
    ret['disabled'] = false
    ret['text'] = 'Stop'
    ret['type'] = 'danger'
  }
  return ret
}
//----------
// auto stop timer
//----------
function createSttAutoStopTimer(callback, time) {
  let autoStopTimer = createTimerFunc(`function (e) {
    setInterval(function () {
      this.postMessage(null)
    }, ${time})
  }`);
  autoStopTimer.onmessage = callback
}
function createTimerFunc(f) {
  var blob = new Blob(['(' + f + ')()']);
  var url = window.URL.createObjectURL(blob);
  var worker = new Worker(url);
  return worker;
}
function languageName(code) {
  let ret = languageList.value.findLast((el => {return el.code == code})).value
  //console.debug(`languageName ${code}: ${ret}`)
  return ret
}
function offlineLanguageName(code) { 
  let ret = offlineLanguageList.value.findLast((el) => { return el.code == code }).value
  //console.debug(`offlineLanguageName ${code}: ${ret}`)
  return ret
}
//----------
// Emit events
//----------
// show full text event
function showFullText() {
  console.debug('showFullText button clicked')
  emit('showFullText')
}
// show conversation event
function showConversation() {
  emit('showConversation')
}
// exit event
function exit() {
  // console.log(roomConfig.value.displayTrans)
  //leaveRoom()
  // back to login
  console.debug('Exit channel button clicked')
  emit('exitButtonClicked')
  // router.push('/realtime')
}
</script>

<style scoped lang="less">
@import '@/theme/theme.less';
@import '@/theme/chatroom.less';
@import '@/theme/subtitle.less';
.config-panel {
  border-radius: 16px;
  // border-color: black;
  // border-width: 1px;
  box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.2);
  padding: 24px;
  margin: 1px;
}
.right-menu-sub-title {
  font-size: @font-size-small;
  margin: 10px 0;
  padding: 0 0 0 0.5rem;
  text-align: left;
}
.right-menu-content {
  text-align: left;
}
.room-debug-info {
  color: @text-color-secondary;
  font-size: @font-size-small;
  margin: 10px 0 0 0;
  padding: 0;
  text-align: left;
}
.room-button-list-fixed {
  position: fixed;
  width: 240px;
  top: 30px;
  right: 2rem;
}
.lang-title {
  font-size: 0.9rem;
  text-align: left;
  margin: 0.3rem 0;
  font-weight: 600;
  color: @text-color-secondary;
}
.lang-text {
  font-size: 0.8rem;
  text-align: left;
  padding: 0 0 0 0.5rem;
  color: @text-color-secondary;
}
.checkbox-main {
  margin-right: 1rem;
}
.checkbox-sub {
  margin-left: 1.5rem;
  margin-right: 1rem;
}
.tool-tips-text {
  width: 100%;
}
.info-icon {
  color: #aaa;
}
.trans-lang-title {
  font-size: @font-size-small;
  text-align: left;
}
</style>
