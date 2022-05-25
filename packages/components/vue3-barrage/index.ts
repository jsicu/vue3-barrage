import vue3Barrage from './vue3-barrage.vue';

import type { App } from 'vue';

vue3Barrage.install = (app: App): void => {
  app.component(vue3Barrage.name, vue3Barrage);
};

export default vue3Barrage;

export const Vue3Barrage = vue3Barrage;
