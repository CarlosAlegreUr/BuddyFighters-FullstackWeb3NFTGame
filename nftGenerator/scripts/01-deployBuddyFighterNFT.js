const { ethers, network } = require("hardhat");
require("dotenv").config()

const {collectionName, collecitonSymbol} = require("../utils/appVariables")
const { networkConfig, developmentNets } = require("../helper-hardhat-config");
const { networks } = require("../hardhat.config");
const { verify } = require("../utils/etherscanVerifyContract")
 


async function main() {

	const [owner] = await ethers.getSigners()
	const buddyFightersNFTFactory = await ethers.getContractFactory("BuddyFighterNFT")
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

	console.log(buddyFightersNFTContract.address)
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
})

module.exports.tags = ["all", "deploy"]
