import { createApp } from 'vue';
import App from './App.vue';
import vueBarrage from './packages/index.ts';

const app = createApp(App);

app.use(vueBarrage);

app.mount('#app');
