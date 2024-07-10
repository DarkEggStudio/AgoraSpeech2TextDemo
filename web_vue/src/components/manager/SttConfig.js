// Stt Config
import { ref } from 'vue'
class SttConfig {
  transcriptions = []
  translations = {}
  enableRec = false
  showTranslation = true
  // rec translation lanaguage
  recLanguage = 'auto'
  recFormat = 'txt' // txt, json
  constructor() {}
  
  clear() {
    this.transcriptions = []
    this.translations = {}
    this.enableRec = false
    this.showTranslation = false
  }
}

let sttConfig = ref(new SttConfig())
export default sttConfig
