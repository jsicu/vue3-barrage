import { createApp } from 'vue';
import App from './App.vue';
import vue3Barrage from '../packages/components/vue3-barrage';

const app = createApp(App);

app.use(vue3Barrage);

app.mount('#app');
