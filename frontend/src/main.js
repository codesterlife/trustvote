import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import Web3 from 'web3';

Vue.config.productionTip = false;

// Setup axios
axios.defaults.baseURL = 'http://localhost:8000/api/';

// Check if Web3 is injected
window.addEventListener('load', async () => {
  // Modern dapp browsers
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    try {
      // Request account access if needed
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      // Accounts now exposed
      store.commit('setWeb3Status', true);
    } catch (error) {
      console.error("User denied account access");
      store.commit('setWeb3Status', false);
    }
  }
  // Legacy dapp browsers
  else if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    // Accounts always exposed
    store.commit('setWeb3Status', true);
  }
  // Non-dapp browsers
  else {
    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    store.commit('setWeb3Status', false);
  }
});

// Global navigation guards
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters.isAuthenticated;
  
  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next({ name: 'Login' });
  } else if (to.matched.some(record => record.meta.requiresAdmin) && !store.getters.isAdmin) {
    next({ name: 'Home' });
  } else {
    next();
  }
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
