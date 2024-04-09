<template>
  <div id="language-panel" class="language-pannel">
    <div class="config-title">Realtime Transcription</div>
    <el-row class="config-row">
      <el-col :span="11" class="config-row-title">Transcription Language:</el-col>
      <el-col :span="13" class="config-row-content">
        <el-autocomplete v-model="transcriptionStr" size="large" :clearable="true" class="config-row-content-input"
          placeholder="Enter Languages"
          :fetch-suggestions="querySearch" 
          :trigger-on-focus="true" 
          @select="handleLanguageSelect" 
          @change="handleLanguageChanged">
        </el-autocomplete>
      </el-col>
    </el-row>
    <div class="config-title" v-if="sttConfig.transcriptions.length>0">Realtime Translation</div>
    <el-row v-for="(item, index) in sttConfig.transcriptions" :key="index" class="config-row">
      <el-col :span="11" class="config-row-title">{{ tanslateItemTitle(item) }}</el-col>
      <el-col :span="13" class="config-row-content">
        <el-autocomplete v-model="translationStrings[item]" class="config-row-content-input" size="large" :clearable="true" 
          placeholder="Enter Languages"
          :fetch-suggestions="querySearch" 
          :trigger-on-focus="true" 
          @select="((trans) => {handleTranslationSelect(item, trans)})"
          @change="((trans) => {handleTranslationChanged(item, trans)})">
        </el-autocomplete>
      </el-col>
    </el-row>
    <hr/>
    <div class="config-title">Offline Transcription</div>
    <el-row class="config-row">
      <el-col :span="11" class="config-row-title">Language</el-col>
      <el-col :span="12" class="config-row-content" id="recLanguage">
        <el-select v-model="sttConfig.recLanguage" size="large">
          <el-option v-for="el in languageList" :key="el.code" :label="el.value" :value="el.code"></el-option>
        </el-select>
        {{ sttConfig.recLanguage }}
      </el-col>
    </el-row>
    <el-row class="config-row">
      <el-col :span="11" class="config-row-title">File Format</el-col>
      <el-col :span="12" class="config-row-content" id="recLanguage">
        <el-select v-model="sttConfig.recFormat" size="large">
          <el-option key="txt" label="Txt" value="txt"></el-option>
          <el-option key="json" label="JSON" value="json"></el-option>
          <el-option key="vtt" label="VTT" value="vtt"></el-option>
        </el-select>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeMount, onBeforeUnmount } from 'vue'
// import { Microphone, Mute, Setting, ChatLineSquare } from '@element-plus/icons-vue'
import langMgr from '@/components/manager/LanguageManager.js'
import sttConfig from '@/components/manager/SttConfig.js'
import roomConfig from '@/components/manager/RoomConfig.js'
//
const RTT_API_VERSION = import.meta.env.VITE_AGORA_RTT_API_VERSION
let languageList = ref([])
let tmpLangList = ref([])
const offlineLanguageList = ref([])
let transcriptionStr = ref('')
let translationStrings = ref({})
// life cycle
onMounted(() => {
  console.debug(`Room Config: ${JSON.stringify(roomConfig.value)}`)
  console.debug(`Rtt Config: ${JSON.stringify(sttConfig.value)}`)
  languageList.value = langMgr.languageList()
  transcriptionStr.value = sttConfig.value.transcriptions.join(',')
  sttConfig.value.transcriptions.forEach((code) => {
    translationStrings.value[code] = sttConfig.value.translations[code].join(',')
  })
  offlineLanguageList.value = langMgr.offlineLangList()
})
// stt
const querySearch = ((queryString, callback) => {
  if (callback) {
    callback(languageList.value)
  }
})
const clearTranscription = (() => {
  console.debug('Clear languages')
  console.debug(sttConfig.value.transcriptions)
  console.debug(sttConfig.value.translations)
  sttConfig.value.transcriptions.forEach((code) => {
    delete sttConfig.value.translations[code]
    translationStrings.value[code] = ''
  })
  sttConfig.value.transcriptions.splice(0)
  transcriptionStr.value = ''
  console.debug(sttConfig.value.transcriptions)
  console.debug(sttConfig.value.translations)
})
const handleLanguageSelect = ((lang) => {
  console.debug(`Select language ${lang.code}`)
  const langs = sttConfig.value.transcriptions
  console.debug(`languages ${langs}`)
  const trans = sttConfig.value.translations
  if (langs.length > 1) {
    if ( langs[1] === lang.code ) {
      console.debug(`Language code ${lang.code} existed.`)
    }
    else {
      const l = langs[0]
      delete trans[l]
      langs.splice(0,1)
      langs.push(lang.code)
      trans[lang.code] = []
    }
  }
  else {
    console.debug(`add language ${lang.code}`)
    if ( langs[0] === lang.code ) {
      console.debug(`Language code ${lang.code} existed.`)
    }
    else {
      langs.push(lang.code)
      trans[lang.code] = []
    }
  }
  transcriptionStr.value = langs.join(',')
  console.debug(`transcriptionStr is ${transcriptionStr.value}`)
  translationStrings.value[lang.code] = ''
})
const handleLanguageChanged = ((val) => {
  console.debug('handleLanguageChanged' + val)
  if (val.length <= 0) {
    clearTranscription()
    return
  }
  const arr = String(val).split(',')
  tmpLangList.value.length = 0
  if (String(val).trim().length < 1) {
    return
  }
  if (arr.length == 1) {
    tmpLangList.value.push(arr[0])
  } else if (arr.length == 2) {
    tmpLangList.value.push(arr[0])
    tmpLangList.value.push(arr[1])
  }
  val = tmpLangList.value.join(',')
})
const handleTranslationSelect = ((sourceLang, translateLang) => {
  let hit = false
  const trans = sttConfig.value.translations
  // check if already in list
  trans[sourceLang].forEach((l) => {
    if (l == translateLang.code) {
      console.debug(translateLang.code + ' existed')
      hit = true
    }
  })
  if (hit) {
    translationStrings.value[sourceLang] = trans[sourceLang].join(',')
    return
  }
  console.debug('add translation target ' + translateLang.value)
  // max is 2
  const maxTranslateTarget = RTT_API_VERSION == '2' ? 5 : 2
  if (trans[sourceLang].length >= maxTranslateTarget && !hit) {
    trans[sourceLang].splice(0, 1)
  }
  trans[sourceLang].push(translateLang.code)
  translationStrings.value[sourceLang] = trans[sourceLang].join(',')
  console.debug(translationStrings.value)
  roomConfig.value.displayTrans[sourceLang] = trans[sourceLang]
})
const handleTranslationChanged = ((sourceLang, translateLang) => {
  console.debug(translateLang)
  const trans = sttConfig.value.translations
  if (translateLang.length <= 0) {
    trans[sourceLang].splice(0)
    return
  }
  // roomConfig.value.translation = translateLang.code
})
const tanslateItemTitle = ((item) => {
  // console.debug(languageList.value)
  if (languageList.value.length > 0) {
    let t = languageList.value.findLast((el => {return el.code == item})).value
    let text = '' + t + ' to:'
    // console.debug(t)
    return text
  }
  return 'Loading'
})
</script>

<style scoped lang="less">
@import '@/theme/theme.less';
.language-pannel {
  background-color: white;
  .config-title {
    text-align: left;
    font-weight: 500;
    color: @title-color;
    padding: 0 0 0 0;
    margin-top: 0.8rem;
  }
  .config-row {
    height: 60px;
    line-height: 60px;
    &-title {
      text-align: right;
      font-weight: 400;
      color: @text-color;
      padding: 0 1rem 0 0
    }
    &-content {
      text-align: left;
      width: 100%;
    }
  }
}
</style>

<style>
.config-row-content-input {
  display: block;
  width: 90%;
}
</style>