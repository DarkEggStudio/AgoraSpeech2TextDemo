// import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css'
// import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// import "./plugin/element.js"
import { library } from '@fortawesome/fontawesome-svg-core'
//
import { faGithub, faWeibo, faTwitter, faFlickr, faInstagram, faFacebook, faAppStoreIos, faApple, faGooglePlay, faGithubSquare } from '@fortawesome/free-brands-svg-icons'
library.add(faGithub, faWeibo, faTwitter, faFlickr, faInstagram, faFacebook, faAppStoreIos, faApple, faGooglePlay, faGithubSquare)
//
import { faHome, faTools, faBookmark, faInfoCircle, faList, faAngleRight, faAngleLeft, faCamera, faComments, faCommentAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
library.add(faHome, faTools, faBookmark, faInfoCircle, faList, faAngleRight, faAngleLeft, faCamera, faComments, faCommentAlt, faSignOutAlt )
//
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons'
library.add(faCalendarAlt)

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const app = createApp(App)

// for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
//   app.component(key, component)
// }

app.component("font-awesome-icon", FontAwesomeIcon)
app.use(createPinia())
app.use(ElementPlus)
app.use(router)

app.mount('#app')
