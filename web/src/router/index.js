import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
// history: createWebHistory(import.meta.env.BASE_URL),
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      // component: () => import('@/views/HomeView.vue')
      redirect: '/realtime',
      // component: () => import('@/components/realtime/RealtimeView.vue')
    },
    //RealtimeView
    {
      path: '/realtime',
      name: 'realtimeView',
      component: () => import('@/components/realtime/RealtimeView.vue')
    },
    {
      path: '/chatroom',
      name: 'ChatroomView',
      component: () => import('@/views/chatroom/ChatroomView.vue')
    },
    {
      path: '/video-chatroom',
      name: 'VideoChatroomView',
      component: () => import('@/views/chatroom/VideoChatroomView.vue')
    },
    //RealtimeConfig
    // {
    //   path: '/rtc-config',
    //   name: 'RTC-Config',
    //   component: () => import('@/components/realtime/RealtimeConfig.vue')
    // },
    // CloudRecodingConfig
    // {
    //   path: '/cloud-recording-config',
    //   name: 'Cloud-Recording-Config',
    //   component: () => import('@/components/realtime/CloudStorageConfigView.vue')
    // },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('@/views/AboutView.vue')
    }
  ]
})

export default router
