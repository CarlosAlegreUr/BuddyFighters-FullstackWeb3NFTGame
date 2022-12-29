const { ethers, getNamedAccounts, network } = require("hardhat")

module.exports = async function (
    palyer1,
    player2,
    tokenId1,
    tokenId2,
    bid1,
    bid2
) {
    let success = [false, "Some error occurred"]
    const blocksToWait = onDevNet ? 1 : 6
    const { deployer } = await getNamedAccounts()
    const independentFundsManagerContract = await ethers.getContract(
        "IndependentFundsManager",
        deployer
    )

    if (
        (await buddyFightersNFTContract.ownerOf(tokenId1)) == palyer1 &&
        (await buddyFightersNFTContract.ownerOf(tokenId2)) == player2
    ) {
        const totalBid = await ethers.utils.parseEther((bid1 + bid2).toString())

        // Calling deploy fight function
        const txResponse =
            await independentFundsManagerContract.useFundsToStartFight(
                [palyer1, player2],
                [tokenId1, tokenId2],
                { value: totalBid }
            )
        const txReceipt = await txResponse.wait(blocksToWait)
        // TODO: Check if some errors occured in transaction.

        // TODO: Inform database a new fight is being tracked.

        success[0] = true
        success[1] = ""
    }
    success[1] = "One of you is not the owner of the NFT."
    return success
}
