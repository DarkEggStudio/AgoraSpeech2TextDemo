// 2023.11.23 Hu.Yuhua
import axios from 'axios'
import sttConfig from './SttConfig.js'
import roomConfig from './RoomConfig.js'
import cloudRecConfig from './CloudRecordingConfig.js'

const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

class CloudRecordingManager {
  startRec(uids, transcription=false, callback) {
    // check cloud recording setting
    let cfg = cloudRecConfig.value
    console.debug(cfg)
    if (cfg.accessKey == '' || cfg.secretKey == '' || cfg.bucket == '' || cfg.vendor == '' || cfg.region == '') {
      let msg = 'Invalid cloud recording config.'
      callback(false, msg)
      return
    }
    // start cloud recording
    let url = `${API_BASE_URL}/stt/recording/start`
    console.debug('Start rec url: ', url)
    const headers = {
      'Content-Type': 'application/json'
    }
    console.debug(sttConfig.value)
    let languageStr = 'auto'//sttConfig.value.transcriptions.join(',')
    console.debug('languageStr:', languageStr)
    const body = {
      'appId': AGORA_APP_ID,
      'channel': roomConfig.value.channelName,
      'uids': uids,
      'enableTranscription': transcription,
      'cloudConfig': {
        'accessKey': cfg.accessKey,
        'secretKey': cfg.secretKey,
        'bucket': cfg.bucket,
        'vendor': Number(cfg.vendor),
        'region': Number(cfg.region)
      }
    }
    console.debug(`${JSON.stringify(sttConfig.value)}}`)
    if ( transcription ) {
      body['enableTranscription'] = true
      body['transcriptionConfig'] = {
        'language': sttConfig.value.recLanguage,
        'format': sttConfig.value.recFormat
      }
    }
    console.debug(`${JSON.stringify(body)}`)
    axios.post(url, body, {headers: headers}).then((res) => {
      console.debug(res.data)
      cfg.resourceId = res.data.resourceId
      cfg.sid = res.data.sid
      callback(true, '')
    }).catch(error => {
      console.debug(error)
      let message = error.response.data.message
      callback(false, (message ?? 'Start cloud recording failed.'))
    }).finally(() => {
      //
    })
  }

  stopRec(uid, callback) {
    let url = `${API_BASE_URL}/stt/recording/stop`
    const headers = {
      'Content-Type': 'application/json'
    }
    const body = {
      'appId': AGORA_APP_ID,
      'channel': roomConfig.value.channelName,
      'uid': uid,
      'resourceId': cloudRecConfig.value.resourceId,
      'sid': cloudRecConfig.value.sid
    }
    axios.post(url, body, {headers: headers}).then((res) => {
      console.debug(res)
      callback(true, '')
    }).catch(error => {
      console.debug(error)
      let message = error.response.data.message
      callback(false, (message ?? 'Stop cloud recording failed.'))
    }).finally(() => {
      //
    })
  }
  // strat record video/audio without transcription
  startRtcRec(uids, callback) {
    // check cloud recording setting
    let cfg = cloudRecConfig.value
    console.debug(cfg)
    if (cfg.accessKey == '' || cfg.secretKey == '' || cfg.bucket == '' || cfg.vendor == '' || cfg.region == '') {
      let msg = 'Invalid cloud recording config.'
      callback(false, msg)
      return
    }
    console.debug(`Record ${uids}`)
    // start cloud recording
    let url = `${API_BASE_URL}/rtc/recording/start`
    console.debug('Start rec url: ', url)
    const headers = {
      'Content-Type': 'application/json'
    }
    console.debug(sttConfig.value)
    const body = {
      'appId': AGORA_APP_ID,
      'channel': roomConfig.value.channelName,
      'uids': uids,
      'cloudConfig': {
        'accessKey': cfg.accessKey,
        'secretKey': cfg.secretKey,
        'bucket': cfg.bucket,
        'vendor': Number(cfg.vendor),
        'region': Number(cfg.region)
      }
    }
    console.debug(`${JSON.stringify(body)}`)
    axios.post(url, body, {headers: headers}).then((res) => {
      console.debug(res.data)
      cfg.resourceId = res.data.resourceId
      cfg.sid = res.data.sid
      callback(true, '')
    }).catch(error => {
      console.debug(error)
      let message = error.response.data.message
      callback(false, (message ?? 'Start cloud recording failed.'))
    }).finally(() => {
      //
    })
    return 0
  }
  // 
  stopRtcRec() {
    console.debug('stopRtcRec')

  }
}

let cloudRecMgr = new CloudRecordingManager()
export default cloudRecMgr
