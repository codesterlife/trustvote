import Web3 from 'web3'
import contractService from '@/contracts/index'

class Web3Service {
  constructor() {
    this.web3 = null
    this.account = null
    this.isAdmin = false
    this.isInitialized = false
    this.networkId = null
    this.adminAddresses = [
      // These would be set from environment variables in a real app
      '0x123456789abcdef123456789abcdef123456789a', // Test admin address
    ]
  }

  // Initialize Web3 with MetaMask
  async init() {
    if (this.isInitialized) return
    
    if (window.ethereum) {
      try {
        // Modern dapp browsers
        this.web3 = new Web3(window.ethereum)
        this.networkId = await this.web3.eth.net.getId()
        
        // Initialize contract service
        await contractService.init(this.web3, this.networkId)
        
        this.isInitialized = true
      } catch (error) {
        console.error('Error initializing Web3:', error)
        throw error
      }
    } else if (window.web3) {
      // Legacy dapp browsers
      this.web3 = new Web3(window.web3.currentProvider)
      this.networkId = await this.web3.eth.net.getId()
      
      // Initialize contract service
      await contractService.init(this.web3, this.networkId)
      
      this.isInitialized = true
    } else {
      throw new Error('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  // Check if MetaMask is installed
  isMetaMaskInstalled() {
    return typeof window.ethereum !== 'undefined'
  }

  // Check if Web3 is connected
  isConnected() {
    return this.web3 !== null && this.account !== null
  }

  // Connect to MetaMask
  async connect() {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed')
    }
    
    try {
      await this.init()
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      this.account = accounts[0]
      
      // Check if the account is an admin
      this.checkAdminStatus()
      
      return this.account
    } catch (error) {
      console.error('Error connecting to MetaMask:', error)
      throw error
    }
  }

  // Get the current account
  async getAccount() {
    if (!this.isConnected()) {
      await this.connect()
    }
    
    return this.account
  }

  // Check if the current account is authenticated
  async isAuthenticated() {
    try {
      const token = localStorage.getItem('token')
      const user = JSON.parse(localStorage.getItem('user'))
      
      // If no token or user, not authenticated
      if (!token || !user) return false
      
      // Check if connected account matches stored user wallet
      const account = await this.getAccount()
      
      // Case-insensitive comparison of Ethereum addresses
      return account.toLowerCase() === user.wallet_address.toLowerCase()
    } catch (error) {
      console.error('Error checking authentication:', error)
      return false
    }
  }

  // Check if the current account is an admin
  checkAdminStatus() {
    if (!this.account) return false
    
    // Check if the account is in the adminAddresses list
    this.isAdmin = this.adminAddresses.some(
      addr => addr.toLowerCase() === this.account.toLowerCase()
    )
    
    return this.isAdmin
  }

  // Store authentication data
  async authenticate(token, user) {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    
    // Update admin status
    await this.checkAdminStatus()
  }

  // Logout
  async logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // Helper to sign a message
  async signMessage(message) {
    if (!this.isConnected()) {
      await this.connect()
    }
    
    try {
      const messageHex = this.web3.utils.utf8ToHex(message)
      const signature = await this.web3.eth.personal.sign(messageHex, this.account, '')
      return signature
    } catch (error) {
      console.error('Error signing message:', error)
      throw error
    }
  }

  // Helper to get network name
  getNetworkName() {
    switch (this.networkId) {
      case 1: return 'Ethereum Main Network (Mainnet)'
      case 3: return 'Ropsten Test Network'
      case 4: return 'Rinkeby Test Network'
      case 5: return 'Goerli Test Network'
      case 42: return 'Kovan Test Network'
      case 1337: return 'Local Ganache Network'
      default: return `Unknown Network (ID: ${this.networkId})`
    }
  }
}

export default new Web3Service()
