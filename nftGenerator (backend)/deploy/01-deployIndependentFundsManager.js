const { ethers, network } = require("hardhat")
const { networks } = require("../hardhat.config")
const { networkConfig, developmentNets } = require("../helper-hardhat-config")
require("dotenv").config()

const { verify } = require("../utils/etherscanVerifyContract")
const {
    updateFrontEndData,
    FRONT_END_CONTRACTS_TESTING_FILE,
} = require("../scripts/04-updateFrontEnd")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()
    let coordinatorAddress,
        vrfSubsId,
        VRFCoordinatorV2MockContract,
        nOfConfitmations

    // console.log("Deploying IndependentFundsManager...")

    // Testnet or local network?
    if (developmentNets.includes(network.name)) {
        // Local network => Get mocks, create && fund subsciption to VRF
        nOfConfitmations = 1
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
            ethers.utils.parseEther("40")
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
        coordinatorAddress,
        vrfSubsId,
        networkConfig[network.config.chainId]["keyHashGasLimit"],
        networkConfig[network.config.chainId]["callBackHashLimit"],
    ]
    await deploy("IndependentFundsManager", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: nOfConfitmations,
    })

    const independentFundsManagerContract = await deployments.get(
        "IndependentFundsManager"
    )
    await updateFrontEndData(
        independentFundsManagerContract,
        "IndependentFundsManager"
    )

    if (developmentNets.includes(network.name)) {
        // Once IndependentFundsManager contract is created, add it as a consumer to the
        // subscibtion of the mocks.
        response = await VRFCoordinatorV2MockContract.addConsumer(
            ethers.utils.formatUnits(vrfSubsId, 0),
            independentFundsManagerContract.address
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
            await verify(independentFundsManagerContract.address, args)
        }
    }

    // Only run when testing in local network
    if (process.env.TESTING_ON_LOCAL === "true") {
        await updateFrontEndData(
            independentFundsManagerContract,
            "IndependentFundsManager",
            FRONT_END_CONTRACTS_TESTING_FILE
        )
    }
    // console.log("-----------------------------------")
}

module.exports.tags = ["all", "fundsManager", "buddyfighters"]
