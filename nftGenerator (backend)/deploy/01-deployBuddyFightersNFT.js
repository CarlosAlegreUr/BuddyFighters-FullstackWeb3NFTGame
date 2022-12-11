const { ethers, network } = require("hardhat")
const { networks } = require("../hardhat.config")
const { deployer } = require("../hardhat.config")
const { networkConfig, developmentNets } = require("../helper-hardhat-config")
require("dotenv").config()

const { deployMocks } = require("./00-deployMocks")

const { collectionName, collecitonSymbol } = require("../utils/appVariables")
const { verify } = require("../utils/etherscanVerifyContract")
const { updateFrontEndData } = require("../update-front-end")

/* 
	Deploys contract with name BuddyFightersNFT (BuddyFightersNFT.sol) and returns it's
	Contract (ethers.js). 
*/
async function deployBuddyFightersNFT() {
    let coordinatorAddress, vrfSubsId

    // Testnet or local network?
    if (developmentNets.includes(network.name)) {
        // Local network => Deploy mocks
        VRFCoordinatorV2MockContract = await deployMocks()
        coordinatorAddress = VRFCoordinatorV2MockContract.address
        const transactionResponse =
            await VRFCoordinatorV2MockContract.createSubscription()
        const transactionReceipt = await transactionResponse.wait(1)
        vrfSubsId = await transactionReceipt.events[0].args.subId
        await VRFCoordinatorV2MockContract.fundSubscription(
            vrfSubsId,
            ethers.utils.parseEther("25")
        )
    } else {
        // Testnet
        // Rinkeby => Get coordinator and subscription ID
        if (network.config.chainId == networks.rinkeby.chainId) {
            coordinatorAddress =
                networkConfig[networks.rinkeby.chainId]["vrfCoordinator"]
            vrfSubsId = networkConfig[networks.rinkeby.chainId]["vrfSubsId"]
        }
    }

    const buddyFightersNFTFactory = await ethers.getContractFactory(
        "BuddyFightersNFT"
    )
    var buddyFightersNFTContract = await buddyFightersNFTFactory.deploy(
        collectionName,
        collecitonSymbol,
        coordinatorAddress,
        vrfSubsId,
        networkConfig[network.config.chainId]["keyHashGasLimit"],
        networkConfig[network.config.chainId]["callBackHashLimit"]
    )
    await buddyFightersNFTContract.deployed()
    await updateFrontEndData(buddyFightersNFTContract, "BuddyFightersNFT")

    // subs = await VRFCoordinatorV2MockContract.getSubscription(ethers.utils.formatUnits(vrfSubsId, 0))
    // response = await VRFCoordinatorV2MockContract.addConsumer(ethers.utils.formatUnits(vrfSubsId, 0), buddyFightersNFTContract.address)

    // Verify on Etherscan if deployed on Rinkeby.
    if (
        process.env.ETHERSCAN_API_KEY &&
        network.config.chainId == networks.rinkeby.chainId
    ) {
        await buddyFightersNFTContract.deployTransaction.wait(6)
        await verify(buddyFightersNFTContract.address, [
            collectionName,
            collecitonSymbol,
        ])
    }

    return buddyFightersNFTContract
}

// Testing execution
// deployBuddyFightersNFT()
//     .then(() => {
//         process.exitCode = 0
//     })
//     .catch((error) => {
//         console.error(error)
//         process.exitCode = 1
//     })

module.exports.tags = ["all", "deploy"]
module.exports = {
    deployBuddyFightersNFT: deployBuddyFightersNFT,
}
