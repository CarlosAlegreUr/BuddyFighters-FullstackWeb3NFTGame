const { ethers, getNamedAccounts } = require("hardhat")
const generateImageAndGetNumbers = require("../utils/generateNFTImage")

async function mintNft() {
    const { deployer } = await getNamedAccounts()
    const buddyFightersNFTContract = await ethers.getContract(
        "BuddyFightersNFT",
        deployer
    )
    const pokemonNumbers = await generateImageAndGetNumbers()
    // TODO: Take image from pokemonImages folder and convert it to svg format.
    // TODO: create nft URI
    // TODO: get NFT name
    const txResponse = await buddyFightersNFTContract.mintNFT(
        "FakeURI",
        "Pokemon",
        "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        pokemonNumbers,
        true,
        { value: ethers.utils.parseEther("0.01") }
    )
    console.log("NFT minted.")
}

mintNft()
module.exports = mintNft
