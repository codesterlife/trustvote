<template>
  <footer class="footer mt-auto py-3 bg-dark text-white">
    <div class="container">
      <div class="row">
        <div class="col-md-6">
          <h5 class="mb-3">TrustVote</h5>
          <p class="small">
            A secure, blockchain-based voting system. All votes are recorded on the Ethereum blockchain, 
            ensuring transparency and immutability.
          </p>
        </div>
        <div class="col-md-3">
          <h5 class="mb-3">Links</h5>
          <ul class="list-unstyled">
            <li><router-link to="/" class="text-white text-decoration-none">Home</router-link></li>
            <li><router-link to="/elections" class="text-white text-decoration-none">Elections</router-link></li>
            <li><a href="#" class="text-white text-decoration-none" @click.prevent="openMetaMask">MetaMask</a></li>
          </ul>
        </div>
        <div class="col-md-3">
          <h5 class="mb-3">Connect</h5>
          <div class="d-flex">
            <a href="#" class="text-white me-3"><i class="fab fa-twitter fa-lg"></i></a>
            <a href="#" class="text-white me-3"><i class="fab fa-github fa-lg"></i></a>
            <a href="#" class="text-white"><i class="fab fa-ethereum fa-lg"></i></a>
          </div>
        </div>
      </div>
      <hr class="my-3 border-secondary">
      <div class="text-center small">
        <p class="mb-0">
          &copy; {{ new Date().getFullYear() }} TrustVote. All rights reserved.
        </p>
        <p class="mt-1 text-secondary">
          Powered by Ethereum Blockchain
        </p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  methods: {
    openMetaMask() {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.request({ method: 'eth_requestAccounts' })
      } else {
        window.open('https://metamask.io/download.html', '_blank')
      }
    }
  }
}
</script>

<style scoped>
.footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 100;
}

@media (max-height: 800px) {
  .footer {
    position: relative;
  }
}
</style>
