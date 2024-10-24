import Vue from 'vue';
import App from './App';
import 'vue-simple-context-menu/dist/vue-simple-context-menu.css';
import VueSimpleContextMenu from 'vue-simple-context-menu';
import * as Store from '../utils/setting';

Vue.component('vue-simple-context-menu', VueSimpleContextMenu);
Vue.config.productionTip = false;
Store.init();

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
});
