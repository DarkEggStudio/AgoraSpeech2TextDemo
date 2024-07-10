//
// RtcManager.js
// 2023.04.07
// by Hu Yuhua
//

import axios from 'axios'
import AgoraRTC from "agora-rtc-sdk-ng"
// import rtmMgr from "./RtmManager.js"
import subtitleManager from "./SubtitleManager.js"

const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID
const AGORA_NEEDS_TOKEN = (import.meta.env.VITE_AGORA_APP_NEED_TOKEN == 1)
const AGORA_LOG_LEVEL = import.meta.env.VITE_AGORA_LOG_LEVEL
class RtcManager {
  rtc = {
    localAudioTrack: null,
    client: null
  }
  rtmClient = null
  uid = 0
  username = ""
  delegate = null
  role = 1
  token = null
  allData = {}
  localAudioPublished = false
  localVideoPublished = false
  rtcAppId = AGORA_APP_ID
  hostList = []
  subscribedAudioUsers = []
  subscribedVideoUsers = []
  
  // init
  constructor() {
    AgoraRTC.setLogLevel(AGORA_LOG_LEVEL)
    // init the RTC Engine
    console.debug('Init RtcManager...')
    this.rtc.client = null
    this.rtc.client = AgoraRTC.createClient({ mode: "live", codec: "vp8", role: this.role });

    this.rtc.client.on("user-published", this.onUserPublished.bind(this))
    this.rtc.client.on("user-joined", this.onUserJoined.bind(this))
    this.rtc.client.on("user-left", this.onUserLeft.bind(this))
    this.rtc.client.on("stream-message", this.onStreamMessage.bind(this))
  }
  
  // join channel
  //  channel: channel Id
  //  channel: username(string, same as RTM user id)
  //  config: 3A config and role
  //  callback: join completion callback
  async join(channel, username, config, callback) {
    // set delegate handler
    console.log(`Agora RTC engine is: ${this.rtc}, appId: ${AGORA_APP_ID}, needs token: ${AGORA_NEEDS_TOKEN}`)
    await this.joinRoom(channel, username, config, callback)
  }

  // get random uint for uid
  randomUInt(min=100000, max=999999) {
    const ret = Math.floor(Math.random() * (max - min + 1) + min)
    console.debug(`Generate RTC uid, between ${min} and ${max}, got ${ret}`)
    return ret
  }

  // join rtc channel
  //  channel: channel Id
  //  channel: username(string, same as RTM user id)
  //  config: 3A config and role
  //  callback: join completion callback
  async joinRoom(channel, username, config, callback) {
    // get random uid for rtc
    this.uid = this.randomUInt()
    console.debug(`Join channel ${channel} with uid ${this.uid}`)

    // get token
    let token = null
    if (AGORA_NEEDS_TOKEN) {
      token = await this.getRtcToken(channel, this.uid, 2)
      console.debug(`Got token: ${token}`)
    }

    try {
      this.uid = await this.rtc.client.join(AGORA_APP_ID, channel, token, this.uid)
    }
    catch (error) {
      console.warn(`Join channel failed: ${error}`)
      callback(false, -999)
      return -999
    }
    // this.hostList.unshift(uid)
    const strUserId = this.uid.toString()

    //this.userList.unshift({ uid: userId, name: username, online: false });
    this.allData[strUserId] = {
      src: './image/me.png', // new URL('../../assets/image/avatar' + userId.toString().slice(-1) + '.png', import.meta.url).href,
      //src: './image/avatar' + userId.toString().slice(-1) + '.png', // new URL('../../assets/image/avatar' + userId.toString().slice(-1) + '.png', import.meta.url).href,
      name: username
    }

    // Create audio track
    let track = await AgoraRTC.createMicrophoneAudioTrack({
      AEC: config.AEC,
      AGC: config.AGC,
      ANS: config.ANS,
    })
    this.rtc.localAudioTrack = track
    // Try to publish audio/video
    if (config.role == 'host' && !this.localAudioPublished) {
      try {
        await this.rtc.client.setClientRole("host")
        await this.rtc.client.unpublish()
        await this.rtc.client.publish([this.rtc.localAudioTrack])
        if (config.video) {
          let videoTrack = await AgoraRTC.createCameraVideoTrack()
          this.rtc.localVideoTrack = videoTrack
          await this.rtc.client.publish([this.rtc.localVideoTrack])
          this.localVideoPublished = true
        }
        console.log('publish start')
        this.localAudioPublished = true
        callback(true, this.uid)
      }
      catch(error) {
        console.warn(`Publish audio/video failed: ${error}`)
        callback(false, -999)
      }
    }
  }

  // leave rtc channel
  async leave() {
    await this.rtc.client.unpublish()
    this.rtc.localAudioTrack.close()
    if (this.rtc.localVideoTrack != undefined) {
      this.rtc.localVideoTrack.close()
    }
    
    this.subscribedAudioUsers.forEach(el => {
      this.rtc.client.unsubscribe(el)
    })
    this.subscribedAudioUsers.splice(0, this.subscribedAudioUsers.length)

    this.subscribedVideoUsers.forEach(el => {
      this.rtc.client.unsubscribe(el)
    })
    this.subscribedVideoUsers.splice(0, this.subscribedVideoUsers.length)

    await this.rtc.client.leave()
    this.localAudioPublished = false
    this.localVideoPublished = false
    this.uid = 0
    this.username = ""
  }

  // get token
  api_svr_url = import.meta.env.VITE_API_BASE_URL
  async getRtcToken(channel, uid, role=1) {
    console.debug("STTApiManager: acquire")
    const url = `${this.api_svr_url}/agora/rtctoken`
    console.debug(url)
    const res = await axios.post(url, {
      "channel": channel,
      "uid": uid,
      "role": role
    }, {
      headers: { 
        'content-type': 'application/json',
        'Accept': 'application/json'
      }
    })
    if (res.status == 200) {
      let token = res.data.token
      return token
    } else {
      return res.data.message
    }
    // .then((res) => {
    //   if (res.status == 200) {
    //     let token = res.data.token
    //     return (true, token)
    //   } else {
    //     return (false, res.data.message)
    //   }
    // }).catch(error => {
    //   console.error(error)
    //   return (false, error.response.data.message ? error.response.data.message : 'Network error')
    // })
  }

  // handler functions
  // on user publish audio/video
  async onUserPublished(user, mediaType) {
    console.debug(`onUserPublished, uid ${user.uid}, ${mediaType} ${mediaType=="audio"}`)
    console.log(`rtc eng2: ${this.rtc}`)
    await this.rtc.client.subscribe(user, mediaType)
    // await this.subscribe(user, mediaType)
    console.log("sub success")
    //let userId = user.uid.toString();
    if (mediaType == "audio") {
      this.subscribedAudioUsers.push(user)
      console.debug(`onUserPublished audio, uid ${user.uid}`)
      const remoteAudioTrack = user.audioTrack;
      remoteAudioTrack.play();
    }
    if (mediaType == 'video') {
      this.subscribedVideoUsers.push(user)
      this.delegate.onRemoteUserVideo(user)
    }
    // this.rtc.client.on("user-unpublished", async (user) => {
    //   await this.rtc.client.unsubscribe(user);
    // });
  }

  // on host user joined rtc channel
  async onUserJoined(user) {
    console.debug(user)
    if (![1000, 2000, this.uid].includes(user.uid)) {
      this.hostList.push(user.uid);
      // const channelAttributes = await this.rtmClient.getChannelAttributes(this.options.channel);
      // console.debug('user join ' + user.uid)
      // if (channelAttributes[user.uid]) {
      //   this.userList.push({ uid: user.uid, name: channelAttributes[user.uid].value, online: false })
      //   this.allData[user.uid] = {
      //     src: './image/avatar' + user.uid.toString().slice(-1) + '.png', //new URL('../img/avatar' + userId.toString().slice(-1) + '.png', import.meta.url).href,
      //     name: channelAttributes[user.uid].value
      //   }
      //   console.debug(this.allData)
      // }
    }
  }

  // on host user leave rtc channel
  async onUserLeft(user, reason) {
    console.warn(`onUserLeft, uid ${user.uid}`)
    // if (rtcMgr.allData[user.uid] != undefined) {
    // await rtcMgr.rtc.client.unsubscribe(user)
    delete rtcMgr.allData[user.uid];
    // rtcMgr.userList.splice(rtcMgr.hostList.indexOf(user.uid), 1);
    // rtcMgr.hostList.splice(rtcMgr.hostList.indexOf(user.uid), 1);
    console.warn(`onUserLeft, uid ${user.uid}`)
    if (rtcMgr.delegate.onRemoteUserLeft == null) {
      return
    }
    rtcMgr.delegate.onRemoteUserLeft(user)
    // }
  }

  // on stream data recived, (the speech to text result come here)
  async onStreamMessage(uid, stream) {
    subtitleManager.praseData(stream, (success, subtitle) => {
      rtcMgr.delegate.updataSubtitleUI(subtitle)
    })
  }
}

// export instance
let rtcMgr = new RtcManager()
export default rtcMgr

// EOF
