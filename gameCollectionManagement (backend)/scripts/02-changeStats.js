const { ethers, getNamedAccounts, network } = require("hardhat")
const { developmentNets } = require("../helper-hardhat-config")

// TO BE IMPLEMENTED
module.exports = async function (
    saveOnBlockchain = false,
    clientAddress,
    tokenId
) {
    saveOnBlockchain = false // TODO: Delete this line if saving metadata onChain ever implemented.
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
            // SEARCH IN PINATA OR NFTSTORAGE PINNED FILE THAT MATHCES TOKENID
            // GET JSON DATA
            // COPY PASTE JSON METADATA BUT WITH NEW STATS
            // PIN NEW METADATA TO PINATA OR NFTSTORAGE
            // UNPIN (DELETE) OLD METADATA FROM PINATA OR NFTSTOAGE
        }

        // Calling changing stats function
        const priceToChangeStats = await ethers.utils.parseEther("0.01")
        try {
            const txResponse =
                await independentFundsManagerContract.useFundsToChangeStats(
                    newToken_URI,
                    tokenId,
                    { value: priceToChangeStats }
                )
        } catch (error) {
            console.log("ERROR IN CHANGING STATS SCRIPT...")
            console.log("----------------------------")
            console.log(error)
            success[0] = false
            success[1] =
                "Error in changing stats transaction, error recieved ---> " +
                `${error}`
            return success
        }
        const txReceipt = await txResponse.wait(blocksToWait)
        success[0] = true
        success[1] = ""
    }
    success[1] = "You are not the owner of the NFT."
    return success
}
