import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import '@shoelace-style/shoelace/dist/themes/light.css'
import { GridLayout, GridItem } from 'grid-layout-plus'

const app = createApp(App)
app.use(createPinia())
app.component('GridLayout', GridLayout).component('GridItem', GridItem)
app.mount('#app')
