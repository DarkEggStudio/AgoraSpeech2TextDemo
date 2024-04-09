<template>
  <div class="chatroom-main">
    <el-row>
      <el-col :span="24">
        <div class="room-view">
          <ChatroomHeaderView @onLanguageClick="openConfig('language')" @onCloudStorageClick="openConfig('cloudStorage')"/>
          <div class="room-subtitle" ref="subtitleArea" >
            <SubtitleCell v-for="(subtitle, index) in subtitleStorage.list" :subtitle="subtitle" :key="index" :displayTranslation="sttConfig.showTranslation"/>
          </div>
        </div>
      </el-col>
      <el-col :span="0">
      </el-col>
    </el-row>
    <ChatRoomRttConfigView :showRecording="true" :rtcJoined="rtcJoined" 
      @showFullText="showFullText"
      @showConversation="showConversation"
      @exit-button-clicked="exit"/>
    <!-- Full Transcription -->
    <el-drawer title="Transcription" v-model="displayFullText">
      <div class="conversation-area">
        {{ fullText() }}
      </div>
    </el-drawer>
    <!-- Conversation -->
    <el-drawer title="Conversation" v-model="displayConversation">
      <div class="conversation-area">
        <div v-for='(item, idx) in subtitleList' :key="idx">
          <div v-if="item.text" class="subtitle-cell">
            <div class="user-name">{{ rtcMgr.allData[item.uid].name }} ({{ item.uid }}) [{{ item.lang }}] {{ item.time != 0 ? new Date(parseInt(item.time)).toLocaleString() : 'N/A' }} </div>
            <div class="subtitle-text">{{ item.text }}</div>
            <div class="translation-text" v-for="(tran, index) in item.translation" :key="index">{{ `[${tran.lang}] ${tran.text}` }}</div>
          </div>
        </div>
      </div>
    </el-drawer>
    <el-dialog title="Cloud Storage Config" v-model="cloudStroageConfigVisible" width="600px" :close-on-click-modal="false">
      <CloudStorageConfigView/>
    </el-dialog>
    <el-dialog title="Language Config" v-model="languageConfigVisible" width="600px" :close-on-click-modal="false">
      <LanguageConfigView/>
    </el-dialog>
  </div>
</template>

<script setup lang="js">
import { ref, onMounted, onBeforeMount, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import router from '@/router';
import rtcMgr from "@/components/manager/RtcManager.js"
import rtmMgr from "@/components/manager/RtmManager.js"
import roomConfig from '@/components/manager/RoomConfig.js'
import sttConfig from '@/components/manager/SttConfig.js'
import cloudRecMgr from '@/components/manager/CloudRecManager.js'
import sttApiManager from '@/components/manager/STTApiManager'
import subtitleManager from "@/components/manager/SubtitleManager.js"
import subtitleStorage from "@/components/manager/SubtitleStorage.js"
import channelInfo from '@/components/manager/ChannelInfo.js'
// 
import SubtitleCell from '@/views/chatroom/SubtitleCell.vue'
import ChatRoomRttConfigView from '@/views/chatroom/ChatRoomRttConfigView.vue'
import LanguageConfigView from '@/views/config/LanguageConfigView.vue'
import CloudStorageConfigView from '@/views/config/CloudStorageConfigView.vue'
import ChatroomHeaderView from '@/views/chatroom/ChatroomHeaderView.vue'
// var
let loading = ref(true)
let displayFullText = ref(false)
let displayConversation = ref(false)
let rtcJoined = ref(false)
const sttStarted = ref(false)
const recStarted = ref(false)
let sttTokenName = ref('')
let sttTaskId = ref('')
// const subtitleList = ref([])
const subtitleUpateKey = ref('')
const subtitleArea = ref(null)
// stt
// let enableCloudRecording = ref(false)
const rtcUidStr = ref('0')
const cloudStroageConfigVisible = ref(false)
const languageConfigVisible = ref(false)
// Life cycle events
onBeforeMount(() => {
  console.debug('Chatroom created.')
  window.addEventListener('beforeunload', e => unloadHandler(e))
  window.addEventListener('unload', function(event) {
      console.debug('[]unload' + event)
      leaveRoom()
      let now = new Date()
      while (new Date() - now < 100) {
        // 
      }
  })
})
onMounted(() => {
  console.debug(roomConfig.value)
  console.debug(sttConfig.value)
  console.debug(SubtitleDelegate)
  console.debug(rtmMgrDelegate)
  rtcMgr.delegate = SubtitleDelegate
  rtmMgr.delegate = rtmMgrDelegate
  if (roomConfig.value.channelName == '') {
    console.warn('No channel name, back to home page...')
    router.push('/')
    return
  }
  else {
    startRtcCall() 
  }
})
onBeforeUnmount(() => {
  console.debug('onBeforeUnmount')
  leaveRoom()
})
// functions
const startRtcCall = (() => {
  // rtc init
  const config = {
    AEC: roomConfig.value.AEC, 
    AGC: roomConfig.value.AGC,
    ANS: roomConfig.value.ANS,
    role: (roomConfig.value.role == 'guest') ? 'host' : roomConfig.value.role
  }
  const cName = roomConfig.value.channelName
  const userName = roomConfig.value.userName
  console.debug(config)
  rtcMgr.join(cName, rtcMgr.uid, config, (success, uid) => {
    if ( success ) {
      console.debug("[ChatRoom View] rtc join successed, uid: " + rtcMgr.uid)
      loading.value = false
      rtcJoined.value = true
      const userId = uid.toString()
      rtcUidStr.value = userId
      channelInfo.value.selfUid = uid
      channelInfo.value.selfUsername = userName
      //self.userList.unshift({ uid: userId, name: self.roomConfig.userName, online: false });
      rtcMgr.allData[userId] = {
        // src: require('../../img/avatar' + userId.toString().slice(-1) + '.png'),
        name: roomConfig.value.userName
      }
      console.debug(rtcMgr.allData)
      // rtm 
      rtmMgr.loginPromise(userId).then(() => {
        console.debug('rtm login success.')
        return rtmMgr.joinPromise(cName)
      }).then(() => {
        console.debug('Join rtm channel success.')
        //
        const data = [{key: 'Testmessage', value: 'This is a test message', revision: -1}]
        rtmMgr.updateChannelMetadata(cName, data)
        rtmMgr.updateSelfUsername(cName, userName)
        // rtmMgr.getMembers(cName)
        rtmMgr.getMembers(cName, (list) => {
          console.debug(`User list: ${JSON.stringify(list)}`)
          channelInfo.value.hosts = list
        })
      }).catch((error) => {
        console.debug(`Start rtm failed. ${error}`)
      })
    }
    else {
      console.debug('Join rtc channel failed.', success)
      leaveRoom()
    }
  })
  return
})
// Stop RTT task
const stopRtt = (() => {
  console.debug('Stop stt button clicked')
  loading.value = true
  sttApiManager.stop(sttTaskId.value, sttTokenName.value, (result, message) => {
    if ( result ) {
      updateUI(true, false, '')
    } else {
      updateUI(false, true, message)
    }
    loading.value = false
  })
})
// ----------
// recording RTT
// ----------
function stopRecording() {
  // rtcUidStr.value
  console.debug('stop Recording')
  loading.value = true
  let uid = rtcUidStr.value
  cloudRecMgr.stopRec(uid, (success, msg) => {
    console.debug('Stop recording finished.')
    loading.value = false
    if (success) {
      console.debug('Success')
      recStarted.value = false
    }
    else {
      ElMessageBox.alert(msg)
      console.debug(msg)
    }
  })
}
// leave room
const leaveRoom = (() => {
  console.debug('Leave room')
  if ( sttTaskId.value != null && sttTaskId.value != '' ) {
    if (sttStarted.value) {
      console.debug('Leave room, stop stt')
      stopRtt()
      sttStarted.value = false
    }
    if (recStarted.value) {
      console.debug('Leave room, stop recording')
      stopRecording()
      recStarted.value = false
    }
  }
  if (rtcMgr.rtc.localAudioTrack) {
    console.debug('Leave room, leave rtc channel')
    rtcMgr.leave()
  }
  subtitleManager.clear()
  //uid = ''
  // sttStarted.value = false
  rtcJoined.value = false
  recStarted.value = false
  //rtmJoined = false
  sttTokenName.value = ''
  sttTaskId.value = ''
  clearConfigs()
})
function exit() {
  console.debug('exit')
  leaveRoom()
  // back to login
  router.push('/realtime')
}
// 
function showFullText() {
  displayFullText.value = true
}
function showConversation() {
  displayConversation.value = true
}
function updateUI(success, started, taskIdOrMessage) {
  sttStarted.value = started;
  if ( success ) {
    loading.value = false;
    sttTaskId.value = taskIdOrMessage;
    //this.sendStartSTTNotificationToPeers(true);
    // auto stop in 10 mins
    createSttAutoStopTimer(() => {
      if (sttTaskId.value != null && sttTaskId.value.length > 0) {
        console.debug('Auto stop STT at: ' + new Date())
        ElMessage({message: 'Auto stop STT.', type: 'message'})
        //this.$message.info('Auto stop STT')
        stopRtt()
      }
    }, 10*60*1000)
  } else {
    sttStarted.value = false;
    loading.value = false;
    ElMessage({message: 'this is a message.', type: 'error'})
    //$message.error(taskIdOrMessage ? taskIdOrMessage : 'network anomaly')
  }
}
const SubtitleDelegate = {
  updataSubtitleUI: ((subtitle) => {
    // console.debug(`updataSubtitleUI for subtitle: ${subtitle}`)
    if (subtitle == null) {
      return
    }
    subtitleUpateKey.value = subtitle.refreshTag
    // isTranslate isFinal
    updateSubtitleList(subtitle)
    return
  })
}
function updateSubtitleList(subtitle) {
  // TODO: will be deleted
  console.log(`[TEST] subtitle data: ${JSON.stringify(subtitle)}`)
  // console.log(`[TEST] subtitleMgr.list: ${JSON.stringify(subtitleStorage.value.list)}`)
  // let a = subtitleManager.list()
  // subtitleList.value = a
  return
}
const fullText = (() => {
  let full = ''
  subtitleStorage.value.list.forEach((sub) => {
    full += '(' + sub.uid + ')' + sub.text
  })
  return full
})
// Timer
function createSttAutoStopTimer(callback, time) {
  let autoStopTimer = create(`function (e) {
    setInterval(function () {
      this.postMessage(null)
    }, ${time})
  }`);
  autoStopTimer.onmessage = callback
}
function create(f) {
  var blob = new Blob(['(' + f + ')()']);
  var url = window.URL.createObjectURL(blob);
  var worker = new Worker(url);
  return worker;
}
//
function unloadHandler(e) {
  console.debug('[]Page unload')
  //if (.taskId && this.tokenName) {
  //await this.leaveRoom();
  console.debug('[]unloadHandler :' + e)
  roomConfig.channelName = ''
  // event.preventDefault();
  // var confirmationMessage = "Are you sure you want to leave?";
  // (e || window.event).returnValue = confirmationMessage; // 兼容 Gecko + IE
  // return confirmationMessage; // 兼容 Gecko + Webkit, Safari, Chrome
}
const rtmMgrDelegate = {
  onChannelMetadataChanged: ((data) => {
    console.log(`RTM Channel Metadata updated to ${JSON.stringify(data)}`)
    if ( !('rttState' in data) ) {
      console.debug('NO rttState in data')
      return
    }
    console.log(`RTM Channel Metadata updated to ${data.rttState.value}`)
    //console.log(`RTM Channel Metadata updated to ${JSON.parse(data.rttState.value)}`)
    let json = JSON.parse(data.rttState.value)
    sttConfig.value.transcriptions = json.transcriptions
    sttConfig.value.translations = json.translations
    roomConfig.value.rttStarted = (json.state == 'started')
    // console.log(`RTM Channel Metadata updated to ${data.translations.value}`)
  })
}
function openConfig(str) {
  console.debug(`..Open config window ${str}`)
  switch(str) {
    case 'language':
      languageConfigVisible.value = true
      break
    case 'cloudStorage':
      cloudStroageConfigVisible.value = true
      break
    default:
      break
  }
}
function clearConfigs() {
  console.debug('Clear configs')
  roomConfig.value.clear()
  sttConfig.value.clear()
}
</script>

<script lang="js">
export default {
  name: 'ChatroomView'
}
</script>

<style scoped lang="less">
@import '@/theme/theme.less';
@import '@/theme/chatroom.less';
@import '@/theme/subtitle.less';
.switch-title {
  font-size: @font-size-small;
}
</style>
