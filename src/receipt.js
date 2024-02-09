import { createApp } from 'vue';
import mitt from 'mitt';

import BalmUI from 'balm-ui';
import BalmUIPlus from 'balm-ui/dist/balm-ui-plus';
import 'balm-ui-css';

import 'typeface-roboto';
import 'typeface-rajdhani';

import './css/style.css';
import './scss/beet.scss';

import {i18n} from './lib/i18n.js';
import Receipt from './components/receipt.vue';

window.onerror = function (msg, url, lineNo, columnNo, error) {
  console.log(error);
  return false;
};

const emitter = mitt();
const app = createApp({});
app.provide('emitter', emitter);

app.config.errorHandler = function (err, vm, info) {
  console.log("error:" + err);
};

app.component('Receipt', Receipt);
app.use(i18n);

window.t = (key, params) => {
    return i18n.global.t(key, params)
}

app.use(BalmUI, {
    $theme: {
        primary: '#C7088E'
    }
});

app.use(BalmUIPlus);
app.mount('#receipt');

emitter.on('i18n', (data) => {
    i18n.global.locale.value = data
});  