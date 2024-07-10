// Room config
import { ref } from 'vue'
class RoomConfig {
  userName = ''
  role = 'host' // host(rtc, rtt start), guest(rtc), audience
  channelName = ''
  type = 'audio' // audio, video
  rttStarted = false
  // cultures = ''
  // translateSource = ''
  // translateTarget = ''
  AEC = true
  AGC = true
  ANS = true
  displayLanguageCode = 'None'
  displayTrans = []

  constructor() {

  }
  clear() {
    this.userName = ''
    this.role = 'host' // host(rtc, rtt start), guest(rtc), audience
    this.channelName = ''
    this.type = 'audio' // audio, video
    this.rttStarted = false
    this.AEC = true
    this.AGC = true
    this.ANS = true
    this.displayLanguageCode = 'None'
  }
}

let roomConfig = ref(new RoomConfig())
export default roomConfig
