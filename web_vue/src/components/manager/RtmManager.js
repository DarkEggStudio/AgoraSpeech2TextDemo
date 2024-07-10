//
// RtmManager.js
// 2023.12.22
// by Hu Yuhua
// 

import AgoraRTM from "agora-rtm"

const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID
const { RTM } = AgoraRTM
class RtmManager {
  rtmClient = null
  delegate = null
  uid = null
  joined = false
  currentChannelName = ''
  isLogin = false

  // init
  constructor() {
    // this.rtmClient = AgoraRTM.createInstance( AGORA_APP_ID, { enableLogUpload: false } );
  }

  // rtm login
  loginPromise(username) {
    console.debug(`Init rtm client username ${username}`)
    let promise = new Promise((resolve, reject) => {
      ( async() => {
        this.rtmClient = new RTM(AGORA_APP_ID, username)
        try {
          const loginRes = await this.rtmClient.login()
          console.debug(`Rtm client login success ${JSON.stringify(loginRes)}`)
          this.isLogin = true
          return resolve()
          // callback(true)
        }
        catch (error) {
          console.debug(`Rtm client login failed ${JSON.stringify(error)}`)
          return reject(error)
          // callback(false)
        }
      })()
    })
    return promise
  }

  // Message channel
  // rtm join message channel
  // promise
  joinPromise(channelName) {
    const channelOption = {
      withMessage: true,
      withPresence: true,
      withMetadata: true,
      withLock: false,
    }

    let promise = new Promise( (resolve, reject) => {
      ( async() => {
        try {
          console.debug(`subscribe channel ${channelName}`)
          let subResult = await this.rtmClient.subscribe(channelName, channelOption)
          console.debug(`subscribe channel ${channelName}, result is ${JSON.stringify(subResult)}`)
          this.rtmClient.addEventListener('message', this.messageEventHandle.bind(this))
          this.rtmClient.addEventListener('presence', this.presenceEventHandle.bind(this))
          this.rtmClient.addEventListener('storage', this.storageEventHandle.bind(this))
          return resolve(channelName)
        }
        catch (error) {
          return reject(error)
        }
      })()
    })
    return promise
  }

  // leave message channel
  async leave(channel) {
    console.debug('rtm logout.')
    // remove event handle
    this.rtmClient.removeEventListener('message', this.messageEventHandle)
    this.rtmClient.removeEventListener('presence', this.presenceEventHandle)
    this.rtmClient.removeEventListener('storage', this.storageEventHandle)
    this.rtmClient.unsubscribe(channel)

    if ( rtmMgr.uid ) {
      await this.rtmClient.deleteChannelAttributesByKeys(channel, [rtmMgr.uid])
      await this.rtmChannel.leave()
    }
    await this.rtmClient.logout()
  }

  updateChannelMetadata(channelName, data) {
    console.debug(`Update channel metadata, data: ${JSON.stringify(data)}`)
    //this.rtmClient.storage.setChannelMetadata(channelName, 'MESSAGE', data)
  }

  // onChannelMetadataChanged(data) {
  //   console.debug(`On channel metadata changed, data: ${JSON.stringify(data)}`) 
  // }

  // Update self info
  updateSelfUsername(channelName, userName) {
    console.debug(`Set user name: ${JSON.stringify(userName)} in channel ${channelName}`)
    const data = {'username': userName}
    this.rtmClient.presence.setState(channelName, 'MESSAGE', data)
  }
  // get rtm member list
  getMembers(channelName, callback) {
    const options = {
      includedUserId: true,
      includedState: true,
      page: "Next_Page_Bookmark"
    }
    this.rtmClient.presence.whoNow(channelName, 'MESSAGE', options).then((res) => {
      // console.debug(`${res.totalOccupancy} user in channel, ${JSON.stringify(res.occupants)}`)
      callback(res.occupants)
    })
  }

  // Event handler
  // onMessageEventHandle
  messageEventHandle(event) {
    console.debug(`onMessageEventHandle: ${JSON.stringify(event)}`)
    if ( this.delegate != null ) {
      console.debug('Call delegate function')
      //this.delegate.onRtmMessageRecived(text, peerId)
    }
  }
  // onStorageEventHandle
  // channel metadata
  storageEventHandle(event) {
    console.debug(`onStorageEventHandle event: ${JSON.stringify(event)}`)
    console.debug(this.delegate)
    if ( this.delegate != null ) {
      console.debug('Call delegate function')
      this.delegate.onChannelMetadataChanged(event.data.metadata)
    }
  }
  // onPresenceEventHandle
  presenceEventHandle(event) {
    console.debug(`onPresenceEventHandle: ${JSON.stringify(event)}`)
    console.debug(this.delegate)
    if ( this.delegate != null ) {
      console.debug('Call Presence delegate function')
      //this.delegate.onRtmMessageRecived(text, peerId)
    }
  }

  // rtm user joined callback
  rtmMemberJoined() {
    if ( this.delegate != null ) {
      this.delegate.rtmMemberJoined(this.start)
    }
  }
}

// export instance
let rtmMgr = new RtmManager()
export default rtmMgr

// EOF
