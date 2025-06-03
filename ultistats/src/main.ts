import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import '@shoelace-style/shoelace/dist/themes/dark.css'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
