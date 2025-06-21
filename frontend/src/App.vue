<template>
  <div id="app">
    <Navbar />
    <main class="container mt-4 mb-5 pb-4">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <Footer />
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import { mapActions } from 'vuex'

export default {
  name: 'App',
  components: {
    Navbar,
    Footer
  },
  created() {
    // Check if user is already logged in or has MetaMask connected
    this.checkAuthState()
    this.initWeb3()
  },
  methods: {
    ...mapActions(['checkAuthState', 'initWeb3'])
  }
}
</script>

<style>
#app {
  font-family: 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom background for blockchain elements */
.blockchain-bg {
  background-color: #f8f9fa;
  border-left: 4px solid #6c63ff;
  padding: 15px;
  border-radius: 5px;
}

/* Wallet connect button styling */
.wallet-btn {
  background-color: #6c63ff;
  color: white;
  border: none;
  transition: all 0.3s ease;
}

.wallet-btn:hover {
  background-color: #5a52d5;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(108, 99, 255, 0.2);
}

/* Voting confirmation animation */
.vote-success {
  animation: pulse 1.5s ease-in-out;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* Election status indicators */
.status-init {
  background-color: #e9ecef;
}

.status-voting {
  background-color: #d4edda;
}

.status-closed {
  background-color: #f8d7da;
}
</style>
