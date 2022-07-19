const { ethers } = require("hardhat");

async function main() {
	const collectionName = "BuddyFighters"
	const collecitonSymbol = "BDFT"

	const [owner] = await ethers.getSigners()
    const buddyFightersNFTFactory = await ethers.getContractFactory("BuddyFighterNFT")
    const buddyFightersNFTContract = await buddyFightersNFTFactory.deploy(collectionName, collecitonSymbol)
	await buddyFightersNFTContract.deployed()


}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
})
