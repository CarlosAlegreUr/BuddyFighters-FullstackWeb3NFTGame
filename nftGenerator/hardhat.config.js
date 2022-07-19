require("dotenv").config()
require("@nomicfoundation/hardhat-toolbox");


const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL
const RINKEBY_SK_01 = process.env.RINKEBY_SK_01


module.exports = {
  solidity: "0.8.9",
  networks: {
		hardhat: {

		},

		rinkeby: {
			url: RINKEBY_RPC_URL,
			accounts: [RINKEBY_SK_01],
			chainId: 4,
		},
  },
};
