<template>
  <div id="app">
    <NavBar />
    <div class="container mt-4">
      <router-view />
    </div>
    <footer class="mt-5 py-3 text-center text-muted border-top">
      <div class="container">
        <p>&copy; 2023 TrustVote - Blockchain-Enhanced Voting System</p>
      </div>
    </footer>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue';

export default {
  name: 'App',
  components: {
    NavBar
  },
  created() {
    // Check if user is already logged in
    this.checkAuthentication();
  },
  methods: {
    checkAuthentication() {
      // If there's a token in localStorage, try to load user data
      const token = localStorage.getItem('token');
      if (token) {
        this.$store.dispatch('fetchUserData');
      }
    }
  }
};
</script>

<style>
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  flex: 1;
}

.card {
  transition: transform 0.3s, box-shadow 0.3s;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background-color: #4285f4;
  border-color: #4285f4;
}

.btn-primary:hover {
  background-color: #2b6def;
  border-color: #2b6def;
}

.btn-success {
  background-color: #0f9d58;
  border-color: #0f9d58;
}

.btn-success:hover {
  background-color: #0c8148;
  border-color: #0c8148;
}

.blockchain-confirmed {
  background-color: #e6f7ff;
  border-left: 4px solid #1890ff;
  padding: 10px;
  margin: 10px 0;
}

.metamask-button {
  display: inline-flex;
  align-items: center;
  background-color: #f6851b;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.metamask-button:hover {
  background-color: #e2761b;
}

.transaction-status {
  padding: 10px;
  border-radius: 5px;
  margin: 10px 0;
}

.transaction-pending {
  background-color: #fff7e6;
  border: 1px solid #ffd591;
}

.transaction-confirmed {
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
}

.transaction-failed {
  background-color: #fff1f0;
  border: 1px solid #ffa39e;
}

.loader {
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 2s linear infinite;
  display: inline-block;
  margin-right: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.vote-confirmation {
  animation: fadeInUp 0.5s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.phase-indicator {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
}

.phase-init {
  background-color: #e6f7ff;
  color: #1890ff;
}

.phase-voting {
  background-color: #f6ffed;
  color: #52c41a;
}

.phase-closed {
  background-color: #f5f5f5;
  color: #595959;
}
</style>
