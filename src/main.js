import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import iView from 'iview'
import 'iview/dist/styles/iview.css'

import '@/styles/index.scss' // global css

import '@/styles/font-awesome-4.7.0/css/font-awesome.min.css' // global css

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control

import * as filters from './filters' // global filters

// import * as echarts from 'echarts'
import echarts from 'echarts'
Vue.prototype.$echarts = echarts

// 引入字体的文件
import './assets/font/iconfont.css'
// 引入全局的样式文件
import './assets/css/global.less'
// 引入主题
import './assets/lib/theme/chalk'
import './assets/lib/theme/westeros'

import ElementResizeDetectorMaker from 'element-resize-detector'
Vue.prototype.$erd = ElementResizeDetectorMaker()

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
// if (process.env.NODE_ENV === 'production') {
//   const { mockXHR } = require('../mock')
//   mockXHR()
// }

// set ElementUI lang to EN
// Vue.use(ElementUI, { locale })
// 如果想要中文版 element-ui，按如下方式声明
Vue.use(ElementUI)
Vue.use(iView)

// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
