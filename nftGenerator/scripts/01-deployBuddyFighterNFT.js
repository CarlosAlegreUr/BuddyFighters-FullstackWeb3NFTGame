const { ethers } = require("hardhat");
const {collectionName, collecitonSymbol} = require("../utils/appVariables")

async function main() {

	const [owner] = await ethers.getSigners()
	const buddyFightersNFTFactory = await ethers.getContractFactory("BuddyFighterNFT")
	const buddyFightersNFTContract = await buddyFightersNFTFactory.deploy(collectionName, collecitonSymbol)
	await buddyFightersNFTContract.deployed()

	console.log(buddyFightersNFTContract.address)

}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
})
