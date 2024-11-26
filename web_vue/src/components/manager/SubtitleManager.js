// 
// SubtitleManager.js
// 2023.04.06
// by Hu Yuhua
//
import { ref } from 'vue'
import protoRoot from "@/protobuf/SttMessage_es6.js"
import subtitleStorage from "@/components/manager/SubtitleStorage.js"
import sttConfig from './SttConfig'

export class Subtitle {
  uid = ''
  userName = ''
  isFinal = false
  text = ''
  lang = ''
  confidence = 0
  time = 0
  translation = []
  isTranslate = false
  isTranslateFinal = false
  refreshTag = ''
  startTextTs = 0
  textTs = 0
  break = false
  translationBreak = false
  constructor() {
  }
}

class SubtitleGroup {
  uid = ''
  subtitles = []
  textTs = 0
  break = false
  constructor() {
  }
}

class SubtitleManager {
  
  breakTimeout = 3000

  // subtitleList = subtitleStorage.value.list
  // _list = ref([])
  praseData(data, callback) {
    let textstream = protoRoot.Agora.SpeechToText.lookup("Text").decode(data)
    if (undefined == textstream) {
      console.warn('Prase data failed.')
      callback(false, null)
      return
    }

    // TODO: fill subtitle
    // break by isFinal flag
    let breakMode = sttConfig.value.breakMode
    console.log(`Break mode: ${breakMode}`)
    switch (breakMode) {
      case 'isFinal':
        this.fillSingleSubtitleList(textstream, callback)
        break
      case 'timeout':
        this.fillGroupSubtitleList(textstream, callback)
        break
      case 'characterCount':
        this.fillSingleSubtitleList(textstream, callback)
        break
      default: 
        this.fillSingleSubtitleList(textstream, callback)
        break
    }
    // if (sttConfig.breakMode == 'isFinal') {
    //   this.fillSingleSubtitleList(textstream, callback)
    // }
    // // break by break timeout
    // this.fillGroupSubtitleList(textstream, callback)
    return
  }

  fillSingleSubtitleList(textstream, callback) {
    switch (textstream.dataType) {
      case 'transcribe': {
        //console.debug(`SubtitleManager::praseData transcribe: ${JSON.stringify(textstream)}, time is ${textstream.time}, ${textstream.durationMs}`)
        // find last same uid and not final
        let textStr = ""
        let isFinal = false
        let confidence = 0.0
        //let list = subtitleStorage.value.singleSubtitleList
        textstream.words.forEach(word => {
          textStr += word.text
          confidence = word.confidence
          isFinal = isFinal ? true : word.isFinal
        })
        
        if (textStr.length == 0) {
          callback(false, null)
          return
        }

        let st = subtitleStorage.value.singleSubtitleList.findLast((el) => {
            let flag = (el.uid == textstream.uid) && (!(el.isFinal))
            return flag
        })
        if (undefined == st) {
          // create a new subtitle
          let subtitle = new Subtitle()
          subtitle.isTranslate = false
          subtitle.uid = textstream.uid
          subtitle.lang = textstream.culture
          subtitle.text = textStr
          subtitle.confidence = confidence
          subtitle.isFinal = isFinal
          subtitle.time = textstream.time + textstream.durationMs
          subtitle.refreshTag = 't_' + textstream.time + textstream.durationMs
          subtitle.startTextTs = textstream.textTs
          subtitle.textTs = textstream.textTs
          subtitleStorage.value.singleSubtitleList.push(subtitle)
          callback(true, subtitle)
          //return
        }
        else {
          // update the subtitle
          st.text = textStr
          st.isFinal = isFinal
          st.time = textstream.time + textstream.durationMs
          st.refreshTag = 't_' + textstream.time + textstream.durationMs
          st.textTs = textstream.textTs
          callback(true, st)
          //return
        }
        return
      }
      case 'translate': {
        console.debug(`SubtitleManager::praseData translate: ${JSON.stringify(textstream)}, time is ${textstream.time}, ${textstream.durationMs}, ${textstream.culture}`)
        let isFinalTrans = false
        // find last one
        let st = subtitleStorage.value.singleSubtitleList.findLast((el) => {
          let flag = (el.uid == textstream.uid) && (textstream.textTs >= el.startTextTs && textstream.textTs <= el.textTs)
          return flag
        })
        if (undefined == st) {
          // console.log(`[TEST] Can not find subtitle`)
          callback(false, undefined)
          return
        }
        else {
          textstream.trans.forEach( transItem => {
            let t = st.translation.findLast((el) => { return (el.lang == transItem.lang) })
            if (undefined == t) {
              st.translation.push( {'lang': transItem.lang, 'text': transItem.texts.join('')} )
            }
            else {
              t.text = transItem.texts.join('')
            }
            isFinalTrans = Boolean(isFinalTrans || Boolean(transItem.isFinal))
            st.isTranslateFinal = isFinalTrans
            //st.isFinal = isFinalTrans
            st.time = textstream.time + textstream.durationMs
            st.refreshTag = 't_' + textstream.time + textstream.durationMs
            st.textTs = textstream.textTs
            callback(true, st)
          })
        }
        break
      }
    }
    return
  }

  fillGroupSubtitleList(textstream, callback) {
    // switch type
    console.log('fillGroupSubtitleList')
    switch (textstream.dataType) {
      case 'transcribe': {
        // find last same uid and not final
        let textStr = ""
        let isFinal = false
        let confidence = 0.0
        textstream.words.forEach(word => {
          textStr += word.text
          confidence = word.confidence
          isFinal = isFinal ? true : word.isFinal
        })
        
        if (textStr.length == 0) {
          callback(false, null)
          return
        }

        let stg = subtitleStorage.value.list.findLast((el) => {
            let flag = (el.uid == textstream.uid) && !(el.break) //&& (!(el.isFinal))
            return flag
        })

        if (undefined == stg) {
          // create a new subtitle
          let subtitle = new Subtitle()
          subtitle.isTranslate = false
          subtitle.uid = textstream.uid
          subtitle.lang = textstream.culture
          subtitle.text = textStr
          subtitle.confidence = confidence
          subtitle.isFinal = isFinal
          subtitle.time = textstream.time + textstream.durationMs
          subtitle.refreshTag = 't_' + textstream.time + textstream.durationMs
          subtitle.startTextTs = textstream.textTs
          subtitle.textTs = textstream.textTs

          let group = new SubtitleGroup()
          group.uid = textstream.uid
          group.textTs = textstream.textTs
          group.break = false
          group.subtitles.push(subtitle)

          console.log(`Group: ${JSON.stringify(group)}`)
          subtitleStorage.value.list.push(group)
          callback(true, subtitle)
          //return
        }
        else {
          //console.log(`data stream textTs: ${textstream.textTs}, stg break ${stg.break}, \n${JSON.stringify(stg)}`)
          if (textstream.textTs - stg.textTs < this.breakTimeout) {
            let st = stg.subtitles.findLast((el) => {
              console.log('debug flag')
              let flag = (el.uid == textstream.uid) && !(el.isFinal)
              return flag
            })
            stg.textTs = textstream.textTs
            stg.break = false
            if (undefined == st) {
              console.log('Is final, add new one into subtitles')
              let subtitle = new Subtitle()
              subtitle.isTranslate = false
              subtitle.uid = textstream.uid
              subtitle.lang = textstream.culture
              subtitle.text = textStr
              subtitle.confidence = confidence
              subtitle.isFinal = isFinal
              subtitle.time = textstream.time + textstream.durationMs
              subtitle.refreshTag = 't_' + textstream.time + textstream.durationMs
              subtitle.startTextTs = textstream.textTs
              subtitle.textTs = textstream.textTs
              
              stg.subtitles.push(subtitle)
              //subtitleStorage.value.list.push(stg)

            }
            else {
              console.log('Not final, update the last one in subtitles')
              // update the subtitle
              st.text = textStr
              st.isFinal = isFinal
              st.time = textstream.time + textstream.durationMs
              st.refreshTag = 't_' + textstream.time + textstream.durationMs
              st.textTs = textstream.textTs
              callback(true, st)
            }
          }
          else {
            // set the last one to break
            stg.break = true
            // create new one
            let subtitle = new Subtitle()
            subtitle.isTranslate = false
            subtitle.uid = textstream.uid
            subtitle.lang = textstream.culture
            subtitle.text = textStr
            subtitle.confidence = confidence
            subtitle.isFinal = isFinal
            subtitle.time = textstream.time + textstream.durationMs
            subtitle.refreshTag = 't_' + textstream.time + textstream.durationMs
            subtitle.startTextTs = textstream.textTs
            subtitle.textTs = textstream.textTs

            let group = new SubtitleGroup()
            group.uid = textstream.uid
            group.textTs = textstream.textTs
            group.break = false
            group.subtitles.push(subtitle)
            console.log(`Group: ${JSON.stringify(group)}`)
            subtitleStorage.value.list.push(group)

            callback(true, subtitle)
          }
        }
        return
      }
      case 'translate': {
        // find last not break subtitle group
        let stg = subtitleStorage.value.list.findLast((el) => {
          let flag = (el.uid == textstream.uid) && !(el.translationBreak) 
          return flag
        })
        let isFinalTrans = false
        let st = stg.subtitles.findLast((el) => {
          let flag = (el.uid == textstream.uid) && (textstream.textTs >= el.startTextTs && textstream.textTs <= el.textTs)
          return flag
        })

        if (undefined == st) {
          callback(false, undefined)
          return
        }
        else {
          console.log(`[TEST] Update the translation, SubtitleGroup: ${JSON.stringify(stg)}`)
          textstream.trans.forEach( transItem => {
            let t = st.translation.findLast((el) => { return (el.lang == transItem.lang) })
            if (undefined == t) {
              console.log(`[TEST] Add the translation[A]. ${transItem.lang}: ${JSON.stringify(transItem.texts)}`)
              st.translation.push( {'lang': transItem.lang, 'text': transItem.texts.join('')} )
            }
            else {
              console.log(`[TEST] Add the translation[U]. ${transItem.lang}: ${JSON.stringify(transItem.texts)}`)
              t.text = transItem.texts.join('')
            }
            console.log(`[TEST] Update the translation: ${JSON.stringify(st)}`)
            isFinalTrans = Boolean(isFinalTrans || Boolean(transItem.isFinal))
            st.isTranslateFinal = isFinalTrans
            //st.isFinal = isFinalTrans
            st.time = textstream.time + textstream.durationMs
            st.refreshTag = 't_' + textstream.time + textstream.durationMs
            st.textTs = textstream.textTs
            callback(true, st)
          })
        }
      }
    }
  }

  // fillSingleSubtitleList(textStream, callback) {
  //   return
  // }

  // fillFullSubtitleList(textStream, callback) {
  //   return
  // }

  clear() {
    subtitleStorage.value.list.splice(0)
  }
}

// export instance
let subtitleManager = (new SubtitleManager())
export default subtitleManager

// 
class TempClass {
  name = "named"
  
  testName() {
    console.log(`Name is ${this.name}`)
  }
}

let tempCls = ref(new TempClass())
export {tempCls}

// EOF
