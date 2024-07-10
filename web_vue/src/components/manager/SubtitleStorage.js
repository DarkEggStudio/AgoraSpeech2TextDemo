import { ref } from 'vue'

class SubtitleStorage {
  list = []
}

// export instance
let subtitleStorage = ref(new SubtitleStorage())
export default subtitleStorage
