/**
 * Truffle Configuration File
 * 
 * For detailed information about configuration, see:
 * https://trufflesuite.com/docs/truffle/reference/configuration
 */

module.exports = {
  // Configure networks for deployment
  networks: {
    // Development network (if using Ganache CLI)
    development: {  // Changed from ganacheCLI to development
      host: "127.0.0.1",
      port: 7545,
      network_id: 1337,  // Match Ganache network ID
      gas: 6721975,
      gasPrice: 20000000000
    }
  },

  // Configure compilers
  compilers: {
    solc: {
      version: "0.8.17",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
};
