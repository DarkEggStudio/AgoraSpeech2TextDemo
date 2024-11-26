import { ref } from 'vue'
class ChannelInfo {
  selfUid = 0
  selfUsername = ''
  hosts = []
  audiences = []

  constructor() {

  }

  clear() {
    this.selfUid = 0
    this.hostUids.length = 0
    this.audienceUids.length = 0
  }
}

let channelInfo = ref(new ChannelInfo())
export default channelInfo