<template>
  <div class="about-div">
    <h1 class="about-title">About this demo</h1>
    <div class="about-text">
      
    </div>
    <h1 class="about-title">Documents</h1>
    <div class="about-text">
      <div>
        <a href="https://docs.agora.io/en/video-calling/overview/product-overview" target="_blank">Agora Video Calling</a>
      </div>
      <div>
        <a href="https://docs-beta.agora.io/en/real-time-transcription/overview/product-overview" target="_blank">Agora Real-Time Transcription</a>
      </div>
    </div>
    <h1 class="about-title">Sample Source Code</h1>
    <div class="about-text">
      <div>
        <a href="" target="_blank">
          TODO: Web demo by Vue3
          <font-awesome-icon :icon="['fab', 'github-square']" class="about-icons"/>
        </a>
      </div>
      <div>
        <a href="" target="_blank">
          TODO: Web demo API server by python
          <font-awesome-icon :icon="['fab', 'github-square']" class="about-icons"/>
        </a>
      </div>
      <!-- <div class="link-text"><a href="https://github.com/DarkEggStudio/AgoraSpeech2TextDemo" target="_blank">Agora Real-Time Transcription</a></div> -->
      <!-- <div class="link-text"><a href="https://github.com/DarkEggStudio/AgoraDemoServer/tree/dev" target="_blank">Agora Real-Time Transcription</a></div> -->
    </div>
  </div>
</template>

<script setup>
// console.debug('Debug')
// console.info('Info')
// console.warn('Warning')
// console.error('Error')
// console.debug('Log')
</script>

<style scoped lang="less">
@import '../theme/base.less';
.about-div {
  .about-title {
    width: 100%;
    text-align: left;
    padding: 0 0 0 0.5rem;
    font-size: @font-size-middle;
    font-weight: @font-weight-bold;
    color: @title-color;
  }
  .about-text {
    width: 100%;
    padding: 0 0 0 1.5rem;
    text-align: left;
    font-size: @font-size-normal;
    font-weight: @font-weight-normal;
    color: @text-color;

    &>div {
      color: #757575;
      line-height: 1.5rem;
      height: 2em;
      width: 80%;
      
      &>a {
        display: inline-block;
        color: @link-color;
        line-height: 1.5rem;
        height: 100%;

        &:hover {
          color: @link-hover-color;
        }
      }
    }
    .link-text {
      font-size: 0.9rem;
      line-height: 1.2rem;
      margin: 0.5rem 0 0.5rem 0;
      
      &::before {
        content: '> ';
      }
    }

    .about-icons {
      font-size: 1.5rem;
      margin-left: 1rem;
    }
  }
}
</style>
