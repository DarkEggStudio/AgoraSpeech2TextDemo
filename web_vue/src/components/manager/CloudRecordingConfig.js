// cloud recording config
import { ref } from 'vue'
class CloudRecordingConfig {
  accessKey = import.meta.env.VITE_CLOUD_STORAGE_ACCESS_KEY
  secretKey = import.meta.env.VITE_CLOUD_STORAGE_SECRET_KEY
  bucket = import.meta.env.VITE_CLOUD_STORAGE_BUCKET
  vendor = import.meta.env.VITE_CLOUD_STORAGE_VENDOR
  region = import.meta.env.VITE_CLOUD_STORAGE_REGION
  // cloudRecordingEnabled = false
  enableTranscription = false
  //
  resourceId = ''
  sid = ''
  constructor() {
  }
}

let cloudRecConfig = ref(new CloudRecordingConfig())
export default cloudRecConfig
