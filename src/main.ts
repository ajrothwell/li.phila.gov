import { createApp } from 'vue'
import { createPinia } from 'pinia'

import '@phila/phila-ui-core/styles/template-light.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
