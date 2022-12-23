const { ethers, getNamedAccounts, network } = require("hardhat")
const generateImageAndGetNumbers = require("../utils/generateNFTImage")
const { developmentNets } = require("../helper-hardhat-config")

// Mints NFT and returns the txReceipt in case of being needed.
async function mintNft(nftUri, nftName, svgImage, saveOnBlockchain, ethPayed) {
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
        saveOnBlockchain,
        { value: ethPayed }
    )
    const txReceipt = await txResponse.wait(1)

    // Only added for testing in local.
    if (developmentNets.includes(network.name)) {
        await VRFCoordinatorV2MockContract.fulfillRandomWordsWithOverride(
            txReceipt.events[2].args.reqId,
            buddyFightersNFTContract.address,
            [
                0,
                254,
                256,
                255,
                Math.round(parseInt(Math.random() * 1000)),
                Math.round(parseInt(Math.random() * 1000)),
            ]
        )
        return txReceipt
    }
    return null
}

module.exports = mintNft

/* Send to nodeJs backend
    function setRarity(
        uint8[2] memory _pkmonNumbers
    ) private pure returns (uint8) {
        uint8 rarity = 1;
        if (
            _pkmonNumbers[0] == 144 ||
            _pkmonNumbers[0] == 145 ||
            _pkmonNumbers[0] == 146 ||
            _pkmonNumbers[0] == 150
        ) {
            rarity *= 3;
        } else {
            if (_pkmonNumbers[0] == 0 || _pkmonNumbers[0] == 151) {
                rarity *= 5;
            }
        }
        if (
            _pkmonNumbers[1] == 144 ||
            _pkmonNumbers[1] == 145 ||
            _pkmonNumbers[1] == 146 ||
            _pkmonNumbers[1] == 150
        ) {
            rarity *= 3;
        } else {
            if (_pkmonNumbers[1] == 0 || _pkmonNumbers[1] == 151) {
                rarity *= 5;
            }
        }
        return rarity;
    } */
