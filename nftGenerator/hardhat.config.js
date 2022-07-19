const env = require("hardhat");

require("@nomicfoundation/hardhat-toolbox");

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
		hardhat: {

		},

		rinkeby: {
			url: RINKEBY_RPC_URL
		},
  },
};
