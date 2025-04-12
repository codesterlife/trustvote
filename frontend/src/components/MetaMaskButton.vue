<template>
  <div>
    <button @click="handleConnect" class="metamask-button" :disabled="isConnecting">
      <img src="https://metamask.io/images/mm-logo.svg" alt="MetaMask" width="20" height="20" class="metamask-logo mr-2">
      {{ buttonText }}
    </button>
    <div v-if="errorMessage" class="mt-2 text-danger">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'MetaMaskButton',
  props: {
    alreadyConnected: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isConnecting: false,
      errorMessage: ''
    };
  },
  computed: {
    buttonText() {
      if (this.isConnecting) {
        return 'Connecting...';
      }
      if (this.alreadyConnected) {
        return 'MetaMask Connected';
      }
      return 'Connect MetaMask';
    }
  },
  methods: {
    async handleConnect() {
      if (this.alreadyConnected) {
        return;
      }
      
      this.isConnecting = true;
      this.errorMessage = '';
      
      try {
        // Check if MetaMask is installed
        if (!window.ethereum) {
          throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
        }
        
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        if (accounts.length === 0) {
          throw new Error('No accounts found. Please create an account in MetaMask.');
        }
        
        // Emit success event with the connected account
        this.$emit('connected', accounts[0]);
      } catch (error) {
        this.errorMessage = error.message || 'Failed to connect to MetaMask';
        this.$emit('error', this.errorMessage);
      } finally {
        this.isConnecting = false;
      }
    }
  }
};
</script>

<style scoped>
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

.metamask-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.metamask-logo {
  margin-right: 8px;
}
</style>
