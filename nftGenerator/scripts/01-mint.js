const { ethers } = require("hardhat")
// const { deployer } = require("../deploy/deployer")
const { buddyFightersNFTContract } = require("../deploy/01-deployBuddyFighterNFT")

async function mintNFT() {
    let buddyFightersNFTContract = await ethers.getContractAt("BuddyFightersNFT", buddyFightersNFTContract.address)
    console.log(buddyFightersNFTContract)
    // const svgImage = "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc"
    // await buddyFightersNFTContract.mintNFT("Fake_URI", "Fake_Name", svgImage, [100,101], true, {value: (ethers.utils.parseEther("0.2"))})
    // stats = await buddyFightersNFTContract.getStats("0")
    // console.log(stats)
}


// Testing execution
mintNFT().then(() => {
	process.exitCode = 0
}).catch((error) => {
  console.error(error)
  process.exitCode = 1
})

