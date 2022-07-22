require("dotenv").config()
require("@nomicfoundation/hardhat-toolbox")
require("@nomiclabs/hardhat-etherscan")
require("./tasks/tasks")


const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL
const RINKEBY_SK_01 = process.env.RINKEBY_SK_01


module.exports = {
  solidity: "0.8.9",

  defaultNetwork: "hardhat",

  networks: {
		hardhat: {

		},

		localhost: {
			url: "http://127.0.0.1:8545",
			chainId: 31337,  
		},

		rinkeby: {
			url: RINKEBY_RPC_URL,
			accounts: [RINKEBY_SK_01],
			chainId: 4,
		},
  },

  namedAccounts: {
	deployer: {
		default: 0,
		4: 0,
		31337: 0,
	}
  }
};
