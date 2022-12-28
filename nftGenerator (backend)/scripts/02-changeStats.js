const { ethers, getNamedAccounts, network } = require("hardhat")
const { developmentNets } = require("../helper-hardhat-config")

module.exports = async function (
    nftName,
    saveOnBlockchain = false,
    clientAddress,
    tokenId
) {
    let success = [false, "Some error occurred"]
    const onDevNet = developmentNets.includes(network.name)
    const blocksToWait = onDevNet ? 1 : 6
    const { deployer } = await getNamedAccounts()
    const independentFundsManagerContract = await ethers.getContract(
        "IndependentFundsManager",
        deployer
    )
    const buddyFightersNFTContract = await ethers.getContract(
        "BuddyFightersNFT",
        deployer
    )

    if ((await buddyFightersNFTContract.ownerOf(tokenId)) == clientAddress) {
        const token_URI = await buddyFightersNFTContract.tokenURI(tokenId)
        let newToken_URI

        if (saveOnBlockchain) {
            // NOT IMPLEMENTED BUT HERE ARE THE INSTRUCTIONS
            // GET TOKEN URI FROM BUDDYFIGHTERS CONTRACT
            // GET JSON FILE FROM TOKEN URI
            // IF TOKEN IS A CID, GET IMAGE
            // CONVERT IMAGE TO SVG AND BASE64 ENCODE IT
            // SAVE ENCODED IMAGE IN METADATA
            // GENERATE RANDOM STATS CALLING INDEPENDENT FUND MANAGER
            // SAVE RANDOM STATS ON METADATA
            // ENCODE BASE64 JSON AND THATS THE NEW TOKEN_URI
            success[0] = false
            success[1] =
                "Saving changedStats on blockchain not implemented yet."
            return success
        } else {
            // TODO:
            // DECODE JSON DATA FROM TOKENURI
            // CHANGE STATS
            // BASE64 ENCODE NEW JSON METADATA
            // PIN NEW METADATA TO IPFS LOCALLY OR NFTSTORAGE
            // UNPIN PREVIOUS METADATA
        }

        // Calling changing stats function
        const priceToChangeStats = await ethers.utils.parseEther("0.01")
        const txResponse =
            await independentFundsManagerContract.useFundsToChangeStats(
                newToken_URI,
                tokenId,
                { value: priceToChangeStats }
            )
        const txReceipt = await txResponse.wait(blocksToWait)
        //  TODO: Check if some errors occured in transaction.

        success[0] = true
        success[1] = ""
    }
    success[1] = "You are not the owner of the NFT."
    return success
}
