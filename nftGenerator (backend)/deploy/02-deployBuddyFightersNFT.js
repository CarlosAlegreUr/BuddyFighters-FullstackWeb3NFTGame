const { ethers, network } = require("hardhat")
const { networks } = require("../hardhat.config")
const { developmentNets } = require("../helper-hardhat-config")
require("dotenv").config()

const { collectionName, collecitonSymbol } = require("../utils/appVariables")
const { verify } = require("../utils/etherscanVerifyContract")
const {
    updateFrontEndData,
    FRONT_END_CONTRACTS_TESTING_FILE,
} = require("../scripts/03-updateFrontEnd")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()
    let inDevNet = developmentNets.includes(network.name)
    const nOfConfitmations = inDevNet ? 1 : 6

    const independentFundsManagerContract = await ethers.getContract(
        "IndependentFundsManager",
        deployer
    )
    const independentFundsManagerAddress =
        independentFundsManagerContract.address

    const args = [
        collectionName,
        collecitonSymbol,
        independentFundsManagerAddress,
    ]
    await deploy("BuddyFightersNFT", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: nOfConfitmations,
    })

    const buddyFightersNFTContract = await deployments.get("BuddyFightersNFT")
    await independentFundsManagerContract.setCollectionAddress(
        buddyFightersNFTContract.address
    )
    await updateFrontEndData(buddyFightersNFTContract, "BuddyFightersNFT")

    if (!inDevNet) {
        // Verify on Etherscan if deployed on Rinkeby. (Change everything to Goerli)
        if (
            process.env.ETHERSCAN_API_KEY &&
            network.config.chainId == networks.rinkeby.chainId
        ) {
            await verify(buddyFightersNFTContract.address, args)
        }
    }

    // Only run when testing in local network
    if (process.env.TESTING_ON_LOCAL === "true") {
        await updateFrontEndData(
            buddyFightersNFTContract,
            "BuddyFightersNFT",
            FRONT_END_CONTRACTS_TESTING_FILE
        )
    }

    // console.log("-----------------------------------")
}

module.exports.tags = ["all", "buddyfighters"]
