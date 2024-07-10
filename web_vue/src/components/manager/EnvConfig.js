// 
class EnvConfig {
  AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID
  API_BASE_URL = import.meta.env.VITE_API_BASE_URL
}
// export instance
let envConfig = new EnvConfig()
export default envConfig
