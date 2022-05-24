import type { App } from 'vue';
import vue3Barrage from './components/vue3-barrage/index.vue';

const components = [vue3Barrage];

const install = (app: App) => {
  components.map(item => {
    app.component(item.name, item);
  });
};

export default {
  install,
  ...components,
};
