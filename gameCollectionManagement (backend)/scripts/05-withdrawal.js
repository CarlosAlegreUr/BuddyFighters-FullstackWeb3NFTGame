const { NFTStorage, File } = require("nft.storage")
const pinataSDK = require("@pinata/sdk")

const fs = require("fs")

const { ethers, getNamedAccounts, network } = require("hardhat")
const generateImage = require("../utils/generateNFTImage")
const { developmentNets } = require("../helper-hardhat-config")

module.exports = async function (addressToSendBalances) {
    let success = [false, "Some error occurred"]
    const onDevNet = developmentNets.includes(network.name)
    const blocksToWait = onDevNet ? 1 : 6
    const { deployer } = await getNamedAccounts()
    const buddyFightersNFTContract = await ethers.getContract(
        "BuddyFightersNFT",
        deployer
    )

    try {
        console.log("Tx withdrawal sent...")
        const txResponse =
            await buddyFightersNFTContract.withdrawContractBalance(
                addressToSendBalances
            )
        console.log("Waiting for confimations...")
        const txReceipt = await txResponse.wait(blocksToWait)
        console.log("Success!")
    } catch (error) {
        console.log("Error in withdrawal...")
        console.log("Error is ---> ", `${error}`)
        success[0] = false
        success[1] = "Error in withdrawal"
        return success
    }
    success[0] = true
    success[1] = ""
    return success
}
