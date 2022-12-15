const { ethers, getNamedAccounts, network } = require("hardhat")
const generateImageAndGetNumbers = require("../utils/generateNFTImage")
const { developmentNets } = require("../helper-hardhat-config")

// Mints NFT and returns the txReceipt in case of being needed.
async function mintNft(nftUri, nftName, svgImage, saveOnBlockchain) {
    const { deployer } = await getNamedAccounts()
    const buddyFightersNFTContract = await ethers.getContract(
        "BuddyFightersNFT",
        deployer
    )
    const pokemonNumbers = await generateImageAndGetNumbers()
    // TODO: Take image from pokemonImages folder and convert it to svg format.
    // TODO: get NFT name
    // TODO: create nft URI
    const VRFCoordinatorV2MockContract = await ethers.getContract(
        "VRFCoordinatorV2Mock",
        deployer
    )
    const txResponse = await buddyFightersNFTContract.mintNFT(
        nftUri,
        nftName,
        svgImage,
        pokemonNumbers,
        true,
        { value: ethers.utils.parseEther("0.01") }
    )
    const txReceipt = await txResponse.wait(1)

    // Only added for testing in local.
    if (developmentNets.includes(network.name)) {
        await VRFCoordinatorV2MockContract.fulfillRandomWordsWithOverride(
            txReceipt.events[2].args.reqId,
            buddyFightersNFTContract.address,
            [
                Math.round(parseInt(Math.random() * 1000)),
                Math.round(parseInt(Math.random() * 1000)),
                Math.round(parseInt(Math.random() * 1000)),
                Math.round(parseInt(Math.random() * 1000)),
                Math.round(parseInt(Math.random() * 1000)),
                Math.round(parseInt(Math.random() * 1000)),
            ]
        )
        return txReceipt
    }
    return null
}

module.exports = mintNft
