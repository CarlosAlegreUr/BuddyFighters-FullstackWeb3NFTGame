const { ethers, network } = require("hardhat")
const { networks } = require("../hardhat.config")
const { networkConfig, developmentNets } = require("../helper-hardhat-config")
require("dotenv").config()

const { collectionName, collecitonSymbol } = require("../utils/appVariables")
const { verify } = require("../utils/etherscanVerifyContract")
const { updateFrontEndData } = require("../update-front-end")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()
    let coordinatorAddress,
        vrfSubsId,
        VRFCoordinatorV2MockContract,
        nOfConfitmations

    // console.log("Deploying BuddyFightersNFT...")

    // Testnet or local network?
    if (developmentNets.includes(network.name)) {
        // Local network => Deploy mocks && create && fund subsciption to VRF
        nOfConfitmations = 1
        await deployments.fixture(["mocks"])
        VRFCoordinatorV2MockContract = await ethers.getContract(
            "VRFCoordinatorV2Mock",
            deployer
        )
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
        nOfConfitmations = 6
        // Rinkeby => Get coordinator and subscription ID
        if (network.config.chainId == networks.rinkeby.chainId) {
            coordinatorAddress =
                networkConfig[networks.rinkeby.chainId]["vrfCoordinator"]
            vrfSubsId = networkConfig[networks.rinkeby.chainId]["vrfSubsId"]
        }
    }

    const args = [
        collectionName,
        collecitonSymbol,
        coordinatorAddress,
        vrfSubsId,
        networkConfig[network.config.chainId]["keyHashGasLimit"],
        networkConfig[network.config.chainId]["callBackHashLimit"],
    ]
    await deploy("BuddyFightersNFT", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: nOfConfitmations,
    })

    const buddyFightersNFTContract = await deployments.get("BuddyFightersNFT")
    await updateFrontEndData(buddyFightersNFTContract, "BuddyFightersNFT")

    if (developmentNets.includes(network.name)) {
        // Once BuddyFighters contract is created, add it as a consumer to the
        // subscibtion of the mocks.
        response = await VRFCoordinatorV2MockContract.addConsumer(
            ethers.utils.formatUnits(vrfSubsId, 0),
            buddyFightersNFTContract.address
        )
        // console.log("Consumer added.")
    } else {
        console.log(
            "Not in development network, fund sibsciption when deploying. (TODO)"
        )
        // Verify on Etherscan if deployed on Rinkeby.
        if (
            process.env.ETHERSCAN_API_KEY &&
            network.config.chainId == networks.rinkeby.chainId
        ) {
            await verify(buddyFightersNFTContract.address, args)
        }
    }
    // console.log("-----------------------------------")
}

module.exports.tags = ["all", "buddyfighters"]
