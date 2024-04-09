//
// STTApiManager.js
// 2023.03.30
// by Hu Yuhua
//

import axios from 'axios'
// import { ref } from 'vue'
import cloudRecConfig from '@/components/manager/CloudRecordingConfig'

const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID
const STT_BASE_PATH = import.meta.env.VITE_AGORA_BASE_URL
const API_BASIC_TOKEN = import.meta.env.VITE_AGORA_BASIC_TOKEN
const RTT_API_VERSION = import.meta.env.VITE_AGORA_RTT_API_VERSION

class STTApiManager {
  // properties
  appId = ''
  channel = ''
  tokenName =  ''
  taskId = ''
  cloudRecordingSid = ''
  createTs = 0
  started = false

  basicAuthentication() {
    return 'Basic ' + API_BASIC_TOKEN
  }

  // acquire STT token
  acquire(channel, callback) {
    console.debug("STTApiManager: acquire")
    const url = `${STT_BASE_PATH}/v1/projects/${AGORA_APP_ID}/rtsc/speech-to-text/builderTokens`
    console.debug(url)
    axios.post(url, {
      "instanceId": channel
    }, {
      headers: { 
        'content-type': 'application/json',
        'Accept': 'application/json',
        'Authorization': this.basicAuthentication(),
        // "Access-Control-Allow-Origin": "*",
        // "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
        // 'Access-Control-Allow-Headers': 'x-requested-with'
      }
    }).then((res) => {
      if (res.status == 200) {
        this.tokenName = res.data.tokenName;
        callback(true, this.tokenName)
      } else {
        callback(false, 'Network error.')
      }
    }).catch(error => {
      console.error(error)
      callback(false, error.response.data.message ? error.response.data.message : 'Network error')
    })
  }

  makeStartBodyV1(channel, languages, sttConfig) {
    let languageStr = sttConfig.transcriptions.join(',')
    let translateConfig = []
    for (const [key, value] of Object.entries(sttConfig.translations)) {
      if (value.length <= 0) {
        continue
      }
      let translateItem = {
        "source": key,
        "target": value
      }
      translateConfig.push(translateItem)
    }
    console.debug('Start lanaguage: ' + languageStr)
    console.debug('Start translate: ' + translateConfig + ':' + translateConfig.length)
    console.debug('cloud rec config:' + cloudRecConfig.value.accessKey)
    let requestBody = {
      "audio": {
        "subscribeSource": "AGORARTC",
        "agoraRtcConfig": {
          "channelName": channel,
          "uid": '1000',
          "token": '', // 可选
          "channelType": 'LIVE_TYPE',
          "subscribeConfig": {
            "subscribeMode": "CHANNEL_MODE"
          },
          "maxIdleTime": 60
        }
      },
      "config": {
        "features": [
          "RECOGNIZE"
        ],
        "recognizeConfig": {
          "language": languageStr,
          "model": "Model",
          "connectionTimeout": 60,
          "output": {
            "destinations": [
              "AgoraRTCDataStream"
            ],
            "agoraRTCDataStream": {
              "channelName": channel,
              "uid": '2000',
              "token": '' // 可选
            }
          }
        }
      }
    }
    // translate
    if (translateConfig.length > 0) {
      (requestBody["config"])["translateConfig"] = {
        "languages": translateConfig
      }
    }
    else {
      delete (requestBody["config"])["translateConfig"]
    }
    // cloud recording
    if (sttConfig.enableRec) {
      // add
      requestBody["config"]["recognizeConfig"]["output"]["destinations"] = [
        "AgoraRTCDataStream",
        "Storage"
      ]
      let cfg = cloudRecConfig.value
      requestBody["config"]["recognizeConfig"]["output"]["cloudStorage"] = [{
        "format": "HLS",
        "storageConfig":{
            'accessKey': cfg.accessKey,
            'secretKey': cfg.secretKey,
            'bucket': cfg.bucket,
            'vendor': Number(cfg.vendor),
            'region': Number(cfg.region),
            "fileNamePrefix": ["agoraRttRealtime", channel]
        }
      }]
    }
    else {
      requestBody["config"]["recognizeConfig"]["output"]["destinations"] = [
        "AgoraRTCDataStream"
      ]
      delete requestBody["config"]["recognizeConfig"]["output"]["cloudStorage"] 
    }
    return requestBody
  }

  makeStartBodyV2(channel, sttConfig) {
    console.debug('Use request body V2...')
    let requestBody = {
      "languages": sttConfig.transcriptions,
      "maxIdleTime": 60,
      "rtcConfig": {
          "channelName": channel,
          "subBotUid": "1000",
          "pubBotUid": "2000",
          // "enableJsonProtocol": false,
          // 
          //"cryptionMode": "5",
          // "decryptionMode": 0,
          //"secret": "RpavG2SVww9dstc1" //"HyhAgoraRttDemo2024"
          // "salt": ""
      }
    }
    // {"languages": ["en-US"],"maxIdleTime": 60,"rtcConfig": {"channelName":hh","subBotUid":1000","pubBotUid":2000"}}
    // translate
    let translateConfig = []
    for (const [key, value] of Object.entries(sttConfig.translations)) {
      if (value.length <= 0) {
        continue
      }
      let translateItem = {
        "source": key,
        "target": value
      }
      translateConfig.push(translateItem)
    }
    if (translateConfig.length > 0) {
      requestBody["translateConfig"] = {
        "forceTranslateInterval": 2,
        "languages": translateConfig
      }
    }
    else {
      delete requestBody["translateConfig"]
    }
    // cloud recording
    if (sttConfig.enableRec) {
      // add
      requestBody["captionConfig"] = {
        "sliceDuration": 60,
      }
      let cfg = cloudRecConfig.value
      requestBody["captionConfig"]["storage"] = {
          'accessKey': cfg.accessKey,
          'secretKey': cfg.secretKey,
          'bucket': cfg.bucket,
          'vendor': Number(cfg.vendor),
          'region': Number(cfg.region),
          "fileNamePrefix": ['AgoraRtt', 'WebDemo', channel]
      }
    }
    else {
      delete requestBody["captionConfig"]
    }
    return requestBody
  }
  // Start
  async start(channel, languages, sttConfig, callback) {
    // no transcription
    if ( sttConfig.transcriptions.length < 0 ) {
      callback(false, 'No transcription language. Can not start STT task.')
      return
    }
    console.debug(`RTT API Version ${RTT_API_VERSION}`)
    let requestBody = RTT_API_VERSION == '2' ? this.makeStartBodyV2(channel, sttConfig) : this.makeStartBodyV1(channel, languages, sttConfig) 
    console.debug(`Request Body ${JSON.stringify(requestBody)}`)
    const url = `${STT_BASE_PATH}/v1/projects/${AGORA_APP_ID}/rtsc/speech-to-text/tasks?builderToken=${this.tokenName}`
    console.debug(url)
    axios.post(url, requestBody, {
      headers: { 
        'content-type': 'application/json',
        'Authorization': this.basicAuthentication()
      }
    }).then((res) => {
      if (res.status == 200) {
        console.debug('Start RTT Task success.')
        this.taskId = res.data.taskId;
        callback(true, this.taskId)
      } else if (res.status == 206) {
        // retry
        this.start(channel, languages, sttConfig, callback)
      } else {
        callback(false, 'network anomaly')
      }
    }).catch(error => {
      console.error(error)
      callback(false, error.response.data.message ? error.response.data.message : 'network anomaly')
    })
  }
  
  // query the STT task
  query(taskId, tokenName, callback) {
    console.debug("STTApiManager.query")
  }
  
  // stop STT task
  async stop(taskId, tokenName, callback) {
    console.debug('STTApiManager.stop')
    if (!this.taskId || this.taskId.length <= 0) {
      callback(false, 'There are currently no tasks');
      return
    }

    let self = this
    if ( self.tokenName && self.taskId ) {
      let res = await fetch(`${STT_BASE_PATH}/v1/projects/${AGORA_APP_ID}/rtsc/speech-to-text/tasks/${self.taskId}?builderToken=${self.tokenName}`, {
        method: 'delete',
        keepalive: true,
        headers: {
          'content-type': 'application/json',
          'Authorization': this.basicAuthentication(),
        }
      })

      let data = await res.text();
      let dataJson = JSON.parse(data);
      if (!dataJson.message) {
        callback(true, "")
        self.clearSttData()
      } else {
        callback(false, dataJson.message)
      }
    } else {
      this.loading = false
    }
  }

  // Is token over due
  isOverdue = (() => {
    return (!this.tokenName || ((Date.now() / 1000 - this.createTs) >= 60 * 5))
  })

  clearSttData() {
    self.channel = ""
    self.taskId = ""
    self.tokenName = ""
    self.createTs = 0
  }
}

// export instance
let sttApiManager = new STTApiManager()
export default sttApiManager

// EOF
