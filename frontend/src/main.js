import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import 'leaflet/dist/leaflet.css'
import './assets/main.scss'

// Import Material Icons
const materialIconsLink = document.createElement('link')
materialIconsLink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons'
materialIconsLink.rel = 'stylesheet'
document.head.appendChild(materialIconsLink)

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')