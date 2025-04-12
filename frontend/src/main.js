import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// Set default axios configuration
axios.defaults.baseURL = 'http://localhost:8000/api/'

// Create Vue application
const app = createApp(App)

// Global error handler
app.config.errorHandler = (err, vm, info) => {
  console.error('Global Error:', err)
  console.error('Vue Component:', vm)
  console.error('Error Info:', info)
}

// Global properties
app.config.globalProperties.$api = axios
app.config.globalProperties.$blockchain = {
  PHASES: {
    INIT: 0,
    VOTING: 1,
    CLOSED: 2
  },
  getPhaseText(phase) {
    const phases = ['Initialization', 'Voting Active', 'Voting Closed']
    return phases[phase] || 'Unknown'
  }
}

// Mount application
app.use(router).mount('#app')
