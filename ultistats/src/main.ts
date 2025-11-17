import './assets/main.css'
import PrimeVue from 'primevue/config'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import '@shoelace-style/shoelace/dist/themes/dark.css'
import { createVuetify } from 'vuetify';
import 'vuetify/dist/vuetify.min.css'

const pinia = createPinia()
const app = createApp(App)

const vuetify = createVuetify({
  // Vuetify configuration options
});
app.use(vuetify)
app.use(pinia)
app.mount('#app')
