require("@nomiclabs/hardhat-waffle");
require("solidity-coverage");
require("@nomiclabs/hardhat-etherscan");
const fs = require('fs');
// const privateKey = fs.readFileSync(".secret").toString().trim() || "01234567890123456789";
// const infuraId = fs.readFileSync(".infuraid").toString().trim() || "";
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});
task("deploy-testnets", "Deploys contract on a provided network")
.setAction(async (taskArguments, hre, runSuper) => {
    const deployElectionContract = require("./scripts/deploy");
    await deployElectionContract(taskArguments);
});
task("deploy-mainnet", "Deploys contract on a provided network")
.addParam("privateKey", "Please provide the private key")
.setAction(async ({privateKey}) => {
    const deployElectionContract = require("./scripts/deploy-with-param");
    await deployElectionContract(privateKey);
});
subtask("print", "Prints a message")
    .addParam("message", "The message to print")
    .setAction(async (taskArgs) => {
      console.log(taskArgs.message);
    });

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337
    },
    ropsten: {
      url: "https://ropsten.infura.io/v3/40c2813049e44ec79cb4d7e0d18de173",
      accounts: [
        "817851de503a8ace1f5cefc4d077b2b520c29715b9176b2a90b73f6384b41dce"
      ]
    },
    mumbai: {
      // Infura
      // url: `https://polygon-mumbai.infura.io/v3/${infuraId}`
      url: "https://polygon-mumbai.infura.io/v3/89aa0cf029e948ee883b0bf906f2f3df",
      accounts: ['817851de503a8ace1f5cefc4d077b2b520c29715b9176b2a90b73f6384b41dce']
    },
    // matic: {
    //   // Infura
    //   // url: `https://polygon-mainnet.infura.io/v3/${infuraId}`,
    //   url: "https://rpc-mainnet.maticvigil.com",
    //   accounts: [privateKey]
    // }
    
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: "CHIRAADNUI814XIT9ST36R63UFNBNDKBDY"
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "../frontend/src/artifacts"
  },
  mocha: {
    timeout: 200000
  }
};