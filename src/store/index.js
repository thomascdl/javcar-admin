import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import settings from './modules/settings'
import user from './modules/user'
import permission from './modules/permission'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    canSelect: false,
    theme: 'chalk'
  },
  mutations: {
    changeTheme(state) {
      if (state.theme === 'chalk') {
        // state.theme = 'vintage'
        state.theme = 'westeros'
      } else {
        state.theme = 'chalk'
      }
    }
  },
  modules: {
    app,
    settings,
    user,
    permission
  },
  getters
})

export default store
