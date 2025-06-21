const ElectionFactory = artifacts.require("ElectionFactory");

module.exports = function (deployer, network, accounts) {
  // Deploy the ElectionFactory contract
  deployer.deploy(ElectionFactory)
    .then(async () => {
      // Get the deployed instance
      const factory = await ElectionFactory.deployed();
      
      console.log(`ElectionFactory deployed at ${factory.address}`);
      
      // For development environments, we can create some test elections
      if (network === 'development' || network === 'ganache') {
        console.log("Setting up test elections...");
        
        // Create a test election that starts immediately and runs for 1 day
        const now = Math.floor(Date.now() / 1000);
        const oneDayLater = now + (60 * 60 * 24);
        
        // Define position IDs for the test election
        const positionIds = [101, 102]; // President and Vice President
        
        await factory.createElection(
          "2023 Student Council Election",
          now,
          oneDayLater,
          positionIds,
          { from: accounts[0] }
        );
        
        console.log("Test election created successfully");
      }
    });
};
