import Vue from 'vue';
import App from './Settings.vue';
import * as Store from '../utils/setting';

Vue.config.productionTip = false;
Store.init();

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
});
