// Stt Config
import { ref } from 'vue'
class SttConfig {
  transcriptions = []
  translations = {}
  enableRec = false
  showTranslation = true
  breakMode = 'isFinal'
  breakTimeout = 3000
  characterCount = 32
  // rec translation lanaguage
  recLanguage = 'auto'
  recFormat = 'txt' // txt, json
  constructor() {}
  
  clear() {
    this.transcriptions = []
    this.translations = {}
    this.enableRec = false
    this.showTranslation = false
    this.breakMode = 'isFinal'
    this.breakTimeout = 3000
    this.characterCount = 40
  }
}

let sttConfig = ref(new SttConfig())
export default sttConfig
