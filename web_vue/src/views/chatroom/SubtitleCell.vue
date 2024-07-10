<template>
<div class="subtitle-cell">
  <div class="user-panel">
    <!-- <div class="user-avatar"><el-avatar size="small" :src="rtcMgr.allData[subtitle.uid].src" :key="rtcMgr.allData[subtitle.uid].src"/></div> -->
    <div class="user-name">
      {{getUsername(subtitle.uid)}}({{ subtitle.uid }})
    </div>
  </div>
  <div class="text-panel" :key="subtitle.refreshTag">
    <div class="subtitle-text">
      [{{ subtitle.lang }}] {{ subtitle.text }}
    </div>
    <div v-for="(tran, index) in subtitle.translation" :key="index">
      <!-- {{ subtitle.translation.length }} -->
      <div class="translation-text" v-if="displayLang(subtitle.lang, tran.lang)" :key="index">{{ `[${tran.lang}] ${tran.text}` }}</div>
    </div>
  </div>
</div>
</template>

<script setup lang="js">
import channelInfo from '@/components/manager/ChannelInfo.js'
import roomConfig from '@/components/manager/RoomConfig';
defineProps({
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
</script>

<style scoped lang="less">
@import '@/theme/subtitle.less';
</style>
