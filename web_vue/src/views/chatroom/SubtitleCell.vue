<template>
<div class="subtitle-cell">
  <div class="user-panel">
    <!-- <div class="user-avatar"><el-avatar size="small" :src="rtcMgr.allData[subtitle.uid].src" :key="rtcMgr.allData[subtitle.uid].src"/></div> -->
    <div class="user-name">
      <!-- {{ JSON.stringify(subtitleGroup) }} -->
      {{getUsername(subtitle.uid)}}({{ subtitle.uid }})
    </div>
  </div>
  <div class="text-panel">
    <div class="subtitle-text">
      [{{ subtitle.lang }}] {{ subtitle.text }}
    </div>
    <!-- <div v-for="(s, index) in subtitleGroup.subtitles" :key="index">
      <div v-for="(tran, index) in s.translation" :key="index">
        <div class="translation-text" v-if="displayLang(s.lang, tran.lang)" :key="index">{{ `[${tran.lang}] ${tran.text}` }}</div>
      </div>
    </div> -->
    <div v-for="(tran, index) in subtitle.translation" :key="index">
      <div class="translation-text" v-if="displayLang(subtitle.lang, tran.lang)" :key="index">{{ `[${tran.lang}] ${tran.text}` }}</div>
    </div>
  </div>
</div>
</template>

<script setup lang="js">
import channelInfo from '@/components/manager/ChannelInfo.js'
import roomConfig from '@/components/manager/RoomConfig'
import sttConfig from '@/components/manager/SttConfig.js'
let props = defineProps({
  subtitle: Object,
  displayTranslation: Boolean
})
function getUsername(uid) {
  let user = channelInfo.value.hosts.findLast((el) => {
    return el.userId == uid
  })
  if (user == null) {
    return 'N/A'
  }
  return user.states.username
}
function displayLang(src, tar) {
  // console.log(roomConfig.value.displayTrans)
  let tars = roomConfig.value.displayTrans[src]
  if (tars == undefined) {
    console.log("No translation data.")
    return false
  }
  return (tars.includes(tar))
}
function getAllTranslationLanguages() {
  let transLangs = []
  sttConfig.value.transcriptions.forEach( l => {
     sttConfig.value.translations[l].forEach( t => {
      transLangs.push(t)
    })
  })
  //console.log(transLangs)
  return transLangs
}
function tanslation(lang) {
  let str = ''
  // console.log(`AAAA ${JSON.stringify(props.subtitleGroup)}`)
  props.subtitleGroup.subtitles.forEach( s => {
    // console.log(`AAAA s ${JSON.stringify(s)}`)
    let t = s.translation.findLast(t => {
      return t.lang == lang
    })
    if (undefined != t) {
      str += t.text
    }
  })
  return str
}
</script>

<style scoped lang="less">
@import '@/theme/subtitle.less';
</style>
