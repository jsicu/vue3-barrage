import type { App, Plugin } from 'vue';
import vueBarrage from './components/vue3-barrage/index.vue';

vueBarrage.install = function (app: App) {
  app.component('vueBarrage', vueBarrage);
  return app;
};

export default vueBarrage;
