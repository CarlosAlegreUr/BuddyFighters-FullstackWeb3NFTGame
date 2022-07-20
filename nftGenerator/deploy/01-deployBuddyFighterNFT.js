const { ethers, network, config } = require("hardhat");
require("dotenv").config()

const {collectionName, collecitonSymbol} = require("../utils/appVariables")
const { networkConfig, developmentNets } = require("../helper-hardhat-config");
const { verify } = require("../utils/etherscanVerifyContract")
 

/* 
	Deploys contract with name BuddyFightersNFT (BuddyFightersNFT.sol) and returns it's
	Contract (ethers.js) object. 
*/ 
async function deployBuddyFightersNFT() {

	const buddyFightersNFTFactory = await ethers.getContractFactory("BuddyFightersNFT")
	const buddyFightersNFTContract = await buddyFightersNFTFactory.deploy(collectionName, collecitonSymbol)
	await buddyFightersNFTContract.deployed()


	// Testnet or local network?
	if(developmentNets.includes(networkConfig[network.config.chainId]["name"])) {
		// Local network => Deploy mocks
		
	} else {
		// Testnet => get Chainlink contracts, verify in etherscan
		if(process.env.ETHERSCAN_API_KEY) {
			await buddyFightersNFTContract.deployTransaction.wait(6)
			await verify(buddyFightersNFTContract.address, [collectionName, collecitonSymbol])
		}
	}
	
	return buddyFightersNFTContract
}


deployBuddyFightersNFT().then(() => {
	console.log("Deployment code run successfully!\n")
	process.exitCode = 0
}).catch((error) => {
  console.error(error)
  process.exitCode = 1
})

module.exports.tags = ["all", "deploy"]
module.exports = {
	deployBuddyFightersNFT: deployBuddyFightersNFT,
}
