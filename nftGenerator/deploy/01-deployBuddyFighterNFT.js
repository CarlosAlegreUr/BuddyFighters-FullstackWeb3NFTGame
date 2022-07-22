const { ethers, network } = require("hardhat");
const { networks } = require("../hardhat.config")
require("dotenv").config()

const { deployer } = require("../hardhat.config")
const {collectionName, collecitonSymbol} = require("../utils/appVariables")
const { networkConfig, developmentNets } = require("../helper-hardhat-config");
const { verify } = require("../utils/etherscanVerifyContract")
 

/* 
	Deploys contract with name BuddyFightersNFT (BuddyFightersNFT.sol) and returns it's
	Contract (ethers.js). 
*/ 
async function deployBuddyFightersNFT() {
	let coordinatorAddress, vrfSubsId

	// Testnet or local network?
	if(developmentNets.includes(networkConfig[network.config.chainId]["name"])) {
		// Local network => Deploy mocks
		
	} else {
		// Testnet 	
		// Rinkeby => Get coordinator and subscription ID
		if(network.config.chainId == networks.rinkeby.chainId){ 
			coordinatorAddress = networkConfig[networks.rinkeby.chainId]["vrfCoordinator"]
			vrfSubsId = networkConfig[networks.rinkeby.chainId]["vrfSubsId"]
		}
	}

	arg = [collectionName, 
			collecitonSymbol, 
			coordinatorAddress, 
			vrfSubsId, 
			networkConfig[network.chainId]["keyHashGasLimit"],
			networkConfig[network.chainId]["callBackHashLimit"]]

	const buddyFightersNFTFactory = await ethers.getContractFactory("BuddyFightersNFT")
	const buddyFightersNFTContract = await buddyFightersNFTFactory.deploy({
		from: deployer[network.chainId],
		args: arg, 
		log: true,
		}
	)
	await buddyFightersNFTContract.deployed()

	// Verify on Etherscan if deployed on Rinkeby.
	if(process.env.ETHERSCAN_API_KEY && network.config.chainId == networks.rinkeby.chainId) {
		await buddyFightersNFTContract.deployTransaction.wait(6)
		await verify(buddyFightersNFTContract.address, [collectionName, collecitonSymbol])
	}

	return buddyFightersNFTContract
}


deployBuddyFightersNFT().then(() => {
	process.exitCode = 0
}).catch((error) => {
  console.error(error)
  process.exitCode = 1
})

module.exports.tags = ["all", "deploy"]
module.exports = {
	deployBuddyFightersNFT: deployBuddyFightersNFT,
}
