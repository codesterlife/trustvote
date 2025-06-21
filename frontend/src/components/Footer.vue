<template>
  <footer class="footer mt-auto py-3 bg-light">
    <div class="container">
      <div class="row">
        <div class="col-md-6">
          <h5 class="mb-3">TrustVote</h5>
          <p class="text-muted">
            A decentralized electronic voting system built using Vue.js, Django, and Ethereum smart contracts.
          </p>
        </div>
        <div class="col-md-3">
          <h5 class="mb-3">Links</h5>
          <ul class="list-unstyled">
            <li><router-link to="/" class="text-decoration-none">Home</router-link></li>
            <li><router-link to="/elections" class="text-decoration-none">Elections</router-link></li>
          </ul>
        </div>
        <div class="col-md-3">
          <h5 class="mb-3">Tech Stack</h5>
          <ul class="list-unstyled">
            <li><i class="fab fa-vuejs me-2"></i>Vue.js</li>
            <li><i class="fab fa-python me-2"></i>Django</li>
            <li><i class="fab fa-ethereum me-2"></i>Ethereum</li>
            <li><i class="fas fa-wallet me-2"></i>MetaMask</li>
          </ul>
        </div>
      </div>
      <hr>
      <div class="row">
        <div class="col-12 text-center">
          <p class="mb-0 text-muted">
             ABHIRAM C <br>Reg No: CUAXMCA025 <br>&copy; {{ currentYear }}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  computed: {
    currentYear() {
      return new Date().getFullYear()
    }
  }
}
</script>

<style scoped>
.footer {
  margin-top: auto;
}
</style>
