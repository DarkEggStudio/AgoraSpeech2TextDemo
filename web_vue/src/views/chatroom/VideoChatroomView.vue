<template>
  <div class="chatroom-main">
    <el-row >
      <el-col :span="18">
        <div class="room-view">
          <div class="room-title">Channel: {{ roomConfig.channelName }}, uid : {{ rtcUidStr }}</div>
          <div class="room-info">Stt Lanaguage(s): {{ roomConfig.cultures }}</div>
          <div v-if="sttConfig.transcriptions.length<=0" class="room-info">No translation</div>
          <div class="room-info" v-for="(obj, index) in sttConfig.transcriptions" :key="index">
            Translate {{ obj }} to {{ sttConfig.translations[obj].join(',') }}
          </div>
          <div class="video-area" ref="videoArea">
            <!-- Main video view -->
            <div class="video-wrapper">
              <div class="video-view" ref="videoPreviewContainer"></div>
              <div class="video-info">Uid: {{ currentDisplayUid }}</div>
              <div class="subtitle-area">
                <div class="video-transcription" ref="selfTranscriptionArea">{{ (lastTranscription(currentDisplayUid)) }}</div>
                <div v-for="(tran, index) in lastSubtitle(currentDisplayUid).translation" :key="index">
                  <!-- {{ subtitle.translation.length }} -->
                  <!-- <div class="video-subtitle" ref="selfSubtitleArea">{{ (lastSubtitleOf(currentDisplayUid)) }}</div> -->
                  <div class="video-subtitle" v-if="displayLang(lastSubtitle(currentDisplayUid).lang, tran.lang)" :key="index">{{ `[${tran.lang}] ${spliceText(tran.text)}` }}</div>
                </div>
              </div>
            </div>
            <!-- thumbnails -->
            <div class="video-thumbnail">
              <div class="video-thumbnail-wapper" @click="setMainVideoView(selfUid)">
                <div class="video-thumbnail-view" ref="selfVideoThumbnail"></div>
                <div class="video-thumbnail-info">Self {{ selfUid }}</div>
              </div>
              <div class="video-thumbnail-wapper" v-for="uid in hostUids" :key="uid" @click="setMainVideoView(uid)">
                <div class="video-thumbnail-view" :ref="el=>{if(el){remoteThumbnails[uid] = el}}"></div>
                <div class="video-thumbnail-info">{{ uid }}</div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <ChatRoomRttConfigView :showRecording="false" :rtcJoined="rtcJoined" 
          @showFullText="showFullText"
          @showConversation="showConversation"
          @exit-button-clicked="exit"/>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeMount, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
// import { Microphone, Mute, Setting, ChatLineSquare } from '@element-plus/icons-vue'
import router from '@/router';
import rtcMgr from "@/components/manager/RtcManager.js"
import roomConfig from '@/components/manager/RoomConfig.js'
import sttConfig from '@/components/manager/SttConfig.js'
import subtitleStorage from "@/components/manager/SubtitleStorage.js"
import cloudRecMgr from '@/components/manager/CloudRecManager.js'
import sttApiManager from '@/components/manager/STTApiManager'
import subtitleManager from "@/components/manager/SubtitleManager.js"
import langMgr from '@/components/manager/LanguageManager.js'
import channelInfo from '@/components/manager/ChannelInfo.js'
import ChatRoomRttConfigView from '@/views/chatroom/ChatRoomRttConfigView.vue'
// properties
const loading = ref(true)
let displayFullText = ref(false)
let displayConversation = ref(false)
const selfUid = ref(0)
const rtcUidStr = ref('')
const hostUids = ref([])
const hostUsers = ref({})
let rtcJoined = ref(false)
const sttStarted = ref(false)
const recStarted = ref(false)
let languageList = ref([])
//let displayLanguageCode = ref('None')
// const subtitleList = ref([])
let sttTokenName = ref('')
let sttTaskId = ref('')
const currentDisplayUid = ref(0)
const currentUser = ref(null)
const selfVideoThumbnail = ref(null)
const videoPreviewContainer = ref(null)
const selfSubtitleArea = ref(null)
const subtitleUpateKey = ref('')
const remoteThumbnails = ref({})
// const RTT_API_VERSION = import.meta.env.VITE_AGORA_RTT_API_VERSION
// life cycle
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
  languageList.value = langMgr.languageList()//loadLanguages()
  rtcMgr.delegate = SubtitleDelegate
  console.debug(rtcMgr.delegate)
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
// subtitle delegate
const SubtitleDelegate = {
  updataSubtitleUI: ((subtitle) => {
    if (subtitle == null) {
      return
    }
    subtitleUpateKey.value = subtitle.refreshTag
    // isTranslate isFinal
    updateSubtitleList(subtitle)
    return
  }),
  onRemoteUserVideo: ((user) => {
    console.log(`Remote host ${user.uid} publish video.`)
    if (!hostUids.value.includes(user.uid)) {
      hostUids.value.push(user.uid)
      hostUsers.value[user.uid] = user
    }
    console.debug(remoteThumbnails.value)
    nextTick(() => {
      const videoView = remoteThumbnails.value[user.uid]
      user.videoTrack.play(videoView)
    })
  }),
  onRemoteUserLeft: ((user) => {
    if (hostUids.value.includes(user.uid)) {
      // remove thumbtail view
      delete hostUsers.value[user.uid]
      hostUids.value.splice(hostUids.value.indexOf(user.uid),1)
    }
  })
}

function updateSubtitleList(subtitle) {
  console.log(`[TEST] subtitle data: ${JSON.stringify(subtitle)}`)
  return
}
function lastSubtitle(uid) {
  let last = subtitleStorage.value.list.findLast((element) => {
    let flag =  ( element.uid == uid )
    return flag
  })
  if (last === undefined) {
    return []
  }
  console.debug(`[TEST] last element of uid ${uid} is ${JSON.stringify(last)}`)
  return last
}
function displayLang(src, tar) {
  // console.log(roomConfig.value.displayTrans)
  let tars = roomConfig.value.displayTrans[src]
  if (tars == undefined) {
    console.log("No translation data.")
    return false
  }
  return (tars.includes(tar))
}
function lastTranscription(uid) {
  let last = subtitleStorage.value.list.findLast((element) => {
    let flag =  ( element.uid == uid )
    return flag
  })
  if (last === undefined) {
    return ''
  }
  let ret = last ? last.text : ''
  return `[${uid}]:${ret.slice(-40)}`
}
function spliceText(str) {
  let retStr = str.slice(-40)
  return retStr
  // return '多年以后，面对行刑队，奥里雷亚诺· 布恩迪亚上校将会回想起父亲带他去见识冰块的那个遥远的下午。那时的马孔多是一个二十户人家的村落，泥巴和芦苇盖成的屋子沿河岸排开，湍急的河水清澈见底，河床里卵石洁白光滑宛如史前巨蛋。世界新生伊始，许多事物还没有名字，提到的时候尚需用手指指点点。'.slice(-56)
  // return 'Many years later as he faced the firing squad, Colonel Aureliano Buendía was to remember that distant afternoon when his father took him to discover ice。'//.slice(-98)
}
// rtc
const startRtcCall = (() => {
  // rtc init
  const config = {
    AEC: roomConfig.value.AEC, 
    AGC: roomConfig.value.AGC,
    ANS: roomConfig.value.ANS,
    role: roomConfig.value.role,
    video: true
  }
  console.debug(config)
  rtcMgr.join(roomConfig.value.channelName, rtcMgr.uid, config, (success, uid) => {
    if ( success ) {
      console.debug("[ChatRoom View] rtc join successed, uid: " + uid)
      selfUid.value = uid
      loading.value = false
      rtcJoined.value = true
      // video preview
      rtcMgr.rtc.localVideoTrack.play(videoPreviewContainer.value)
      // rtcMgr.rtc.localVideoTrack.play(selfVideoThumbnail.value)
      // const userId = uid.toString()
      rtcUidStr.value = uid.toString()
      channelInfo.value.uid = uid
      // set thumbtail
      currentDisplayUid.value = uid
      selfVideoThumbnail.value.innerText = 'Now play'
      //self.userList.unshift({ uid: userId, name: self.roomConfig.userName, online: false });
      rtcMgr.allData[uid] = {
        // src: require('../../img/avatar' + userId.toString().slice(-1) + '.png'),
        name: roomConfig.value.userName
      }
      console.debug(rtcMgr.allData)
    }
    else {
      console.debug('Join channel failed.', success)
      leaveRoom()
    }
  })
  return
})
function setMainVideoView(uid) {
  if (currentDisplayUid.value == uid) {
    console.debug('Click same thumbtail')
    return
  }
  console.debug(`${uid} is self uid(${selfUid.value}) ${uid == selfUid.value}`)
  if ( uid == selfUid.value ) {
    console.debug(`Display self preview, uid: ${uid}`)
    rtcMgr.rtc.localVideoTrack.play(videoPreviewContainer.value)
    selfVideoThumbnail.value.innerText = 'Now play'
    currentUser.value = null
    // 
    const user = hostUsers.value[currentDisplayUid.value]
    console.debug(user)
    const videoView = remoteThumbnails.value[user.uid]
    videoView.innerText = ''
    user.videoTrack.play(videoView)
    currentDisplayUid.value = uid
  }
  else {
    console.debug(`Display remote video, uid: ${uid}`)
    if (currentUser.value != null) {
      const videoView = remoteThumbnails.value[currentUser.value.uid]
      videoView.innerText = ''
      currentUser.value.videoTrack.play(videoView)
    }
    else {
      console.debug('set self to thumb')
      selfVideoThumbnail.value.innerText = ''
      rtcMgr.rtc.localVideoTrack.play(selfVideoThumbnail.value)
    }
    const user = hostUsers.value[uid]
    const v = remoteThumbnails.value[uid]
    v.innerText = 'Now play'
    currentUser.value = user
    console.debug(user)
    user.videoTrack.play(videoPreviewContainer.value)
    currentDisplayUid.value = uid
  }
  console.debug(`currentDisplayUid is ${currentDisplayUid.value}`)
}
// RTT
// ----------
// Real-Time RTT
// ----------
const stopStt = (() => {
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
      stopStt()
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
})
function exit() {
  leaveRoom()
  // back to login
  console.debug('teetttt')
  router.push('/realtime')
}
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
        stopStt()
      }
    }, 10*60*1000)
  } else {
    sttStarted.value = false;
    loading.value = false;
    ElMessage({message: 'this is a message.', type: 'error'})
  }
}
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
function showFullText() {
  displayFullText.value = true
}
function showConversation() {
  displayConversation.value = true
}
</script>

<style scoped lang="less">
@import '@/theme/theme.less';
@import '@/theme/chatroom.less';
@import '@/theme/subtitle.less';

.video-area {
    display: inline-block;
    text-align: left;
    padding: 1rem 1rem 0rem 1rem;
    width: 100%;
    height: 100%;
    margin-bottom: 0px;
    // overflow: auto;
    box-sizing: border-box;
  }
.switch-title {
  font-size: @font-size-small;
  margin: 10px 0;
  padding: 0 0 0 0.5rem;
  text-align: left;
}
.video-thumbnail {
  height: auto;
  &-wapper {
    display: inline-block;
    width: 150px;
    height: 100px;
    background-color: black;
    margin: 0 10px 0 0;
  }
  &-info {
    left: 0px;
    bottom: 8px;
    // width: 100%;
    font-size: @font-size-small;
    line-height: 1rem;
    color: white;
    padding: 4px 0 4px 0.5rem;
    background-color: rgba(0, 0, 0, 0.4);
  }
  &-view {
    width: 150px;
    height: 100px;
    line-height: 100px;
    text-align: center;
    font-size: 1.2rem;
    font-weight: 800;
    color: white;
  }

}
.video-wrapper {
  width: 100%;
  margin: 10px auto;
  padding: 0px;
  position: relative;
  // height: 90px;
  .video-info {
    position: absolute;
    background-color: rgba(10, 90, 80, 0.8);
    font-size: @font-size-small;
    padding: 0.3rem 0.5rem;
    color: white;
    font-weight: 500;
    top: 10px;
    left: 10px;
  }
  .video-view {
    width: 100%;
    height: 320px;
    background-color: gray;
  }
  .subtitle-area {
    position: absolute;
    bottom: 1rem;
  }
  .video-transcription {
    // position: absolute;
    // display: inline;
    bottom: 2rem;
    width: auto;
    background-color: rgba(00, 00, 00, 0.5);
    color: white;
    padding: 0.3rem 0.5rem;
    margin: 0 0 4px 1rem;
    font-weight: 500;
    font-size: @font-size-small;

    // overflow:hidden; 
    // text-overflow:ellipsis;
    // display:-webkit-box; 
    // -webkit-box-orient: vertical;
    // -webkit-line-clamp: 2; 
  }
  .video-subtitle {
    // position: absolute;
    // display: inline;
    bottom: 0rem;
    width: auto;
    background-color: rgba(00, 00, 00, 0.5);
    color: white;
    padding: 0.3rem 0.5rem;
    margin: 0 0 4px 1rem;
    font-weight: 500;
    font-size: @font-size-small;

    // overflow:hidden; 
    // text-overflow:ellipsis;
    // display:-webkit-box; 
    // -webkit-box-orient: vertical;
    // -webkit-line-clamp: 2; 
  }
}
</style>