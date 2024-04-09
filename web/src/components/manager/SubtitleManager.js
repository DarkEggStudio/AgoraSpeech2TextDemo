// 
// SubtitleManager.js
// 2023.04.06
// by Hu Yuhua
//
import { ref } from 'vue'
import protoRoot from "@/protobuf/SttMessage_es6.js"
import subtitleStorage from "@/components/manager/SubtitleStorage.js"

class Subtitle {
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
  textTs = 0
  constructor() {
  }
}

class SubtitleManager {
  //subtitleList = subtitleStorage.value.list
  // _list = ref([])

  praseData(data, callback) {
    let textstream = protoRoot.Agora.SpeechToText.lookup("Text").decode(data)
    if (undefined == textstream) {
      console.warn('Prase data failed.')
      callback(false, null)
      return
    }
    // console.debug((textstream.lang))
    // check type transcribe or translate
    // console.log(`Stream data: ${JSON.stringify(textstream)}`)

    // switch type
    switch (textstream.dataType) {
      case 'transcribe': {
        // console.debug(`SubtitleManager::praseData transcribe: ${JSON.stringify(textstream)}, time is ${textstream.time}, ${textstream.durationMs}`)
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

        let st = subtitleStorage.value.list.findLast((el) => {
            let flag = (el.uid == textstream.uid) && (!(el.isFinal))
            return flag
        })
        if (undefined == st) {
          // create a new subtitle
          // console.log(`[TEST] Add new subtitle.`)
          let subtitle = new Subtitle()
          subtitle.isTranslate = false
          subtitle.uid = textstream.uid
          subtitle.lang = textstream.culture
          subtitle.text = textStr
          subtitle.confidence = confidence
          subtitle.isFinal = isFinal
          subtitle.time = textstream.time + textstream.durationMs
          subtitle.refreshTag = 't_' + textstream.time + textstream.durationMs
          subtitle.textTs = textstream.textTs
          subtitleStorage.value.list.push(subtitle)
          callback(true, subtitle)
          //return
        }
        else {
          // update the subtitle
          // console.log(`[TEST] Update subtitle.`)
          st.text = textStr
          st.isFinal = isFinal
          st.time = textstream.time + textstream.durationMs
          st.refreshTag = 't_' + textstream.time + textstream.durationMs
          st.textTs = textstream.textTs
          callback(true, st)
          //return
        }
        // console.log(`[TEST] subtitle list is\n ${subtitleStorage.value.list}`)
        return
      }
      case 'translate': {
        //let transTextStr = ""
        // console.debug(`SubtitleManager::praseData translate: ${JSON.stringify(textstream)}, time is ${textstream.time}, ${textstream.durationMs}`)
        let isFinalTrans = false
        // find last one
        let st = subtitleStorage.value.list.findLast((el) => {
          let flag = (el.uid == textstream.uid) && (el.textTs == textstream.textTs)
          return flag
        })
        if (undefined == st) {
          // console.log(`[TEST] Can not find subtitle`)
          callback(false, undefined)
          return
        }
        else {
          textstream.trans.forEach( transItem => {
            // console.log(`[TEST] Update the subtitle.`)
            //let subtitle = new Subtitle()
            let t = st.translation.findLast((el) => { return (el.lang == transItem.lang) })
            if (undefined == t) {
              st.translation.push( {'lang': transItem.lang, 'text': transItem.texts.join('')} )
            }
            else {
              t.text = transItem.texts.join('')
            }
            isFinalTrans = Boolean(isFinalTrans || Boolean(transItem.isFinal))
            st.isTranslateFinal = isFinalTrans
            st.isFinal = isFinalTrans
            st.time = textstream.time + textstream.durationMs
            st.refreshTag = 't_' + textstream.time + textstream.durationMs
            st.textTs = textstream.textTs
            // console.debug(subtitle.translation)
            // this.appendSubtitle(subtitle)
            callback(true, st)
          })
        }
        break
      }
    }

    return
  }

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
