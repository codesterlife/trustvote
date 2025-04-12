/**
 * Truffle Configuration File
 * 
 * For detailed information about configuration, see:
 * https://trufflesuite.com/docs/truffle/reference/configuration
 */

module.exports = {
  // Configure networks for deployment
  networks: {
    // Ganache development network
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*", // Match any network id
      gas: 6721975,
    },
    
    // Ganache CLI development network (if using Ganache CLI)
    ganacheCLI: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
    
    // Public test networks
    goerli: {
      provider: () => {
        // This would typically use HDWalletProvider and an Infura URL,
        // but we'll use environment variables for secrets
        if (!process.env.INFURA_KEY || !process.env.PRIVATE_KEY) {
          console.error("Missing INFURA_KEY or PRIVATE_KEY environment variables");
          process.exit(1);
        }
        
        const HDWalletProvider = require('@truffle/hdwallet-provider');
        return new HDWalletProvider(
          process.env.PRIVATE_KEY,
          `https://goerli.infura.io/v3/${process.env.INFURA_KEY}`
        );
      },
      network_id: 5,
      gas: 5500000,
      gasPrice: 10000000000, // 10 gwei
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    
    // Uncomment to enable other networks as needed
    /*
    // Ethereum Mainnet - Use with caution!
    mainnet: {
      provider: () => {
        if (!process.env.INFURA_KEY || !process.env.PRIVATE_KEY) {
          console.error("Missing INFURA_KEY or PRIVATE_KEY environment variables");
          process.exit(1);
        }
        
        const HDWalletProvider = require('@truffle/hdwallet-provider');
        return new HDWalletProvider(
          process.env.PRIVATE_KEY,
          `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`
        );
      },
      network_id: 1,
      gas: 5500000,
      gasPrice: 20000000000, // 20 gwei
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: false
    }
    */
  },

  // Set default mocha options
  mocha: {
    timeout: 100000
  },

  // Configure compilers
  compilers: {
    solc: {
      version: "0.8.17", // Fetch exact version from solc-bin
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  },

  // Plugin for contract deployment
  plugins: [
    'truffle-plugin-verify'
  ],
};
