import { ref } from 'vue'

class SubtitleStorage { 
  list = [] // SubtitleGroup
  singleSubtitleList = []
}

// export instance
let subtitleStorage = ref(new SubtitleStorage())
export default subtitleStorage
