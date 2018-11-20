import regeneratorRuntime from "regenerator-runtime";
import "regenerator-runtime/runtime";
import $ from "jquery";
import VueChartkick from 'vue-chartkick'
import Vue from 'vue'
import Chart from 'chart.js'
import vSelect from 'vue-select'
import VTooltip from 'v-tooltip'
import AsyncComputed from 'vue-async-computed'

Vue.use(AsyncComputed);
Vue.use(VTooltip);
Vue.component('v-select', vSelect);
Vue.use(VueChartkick);

