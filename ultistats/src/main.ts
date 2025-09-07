import './assets/main.css'
import PrimeVue from 'primevue/config'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import '@shoelace-style/shoelace/dist/themes/dark.css'
const pinia = createPinia()
const app = createApp(App)
app.use(pinia)
app.mount('#app')
