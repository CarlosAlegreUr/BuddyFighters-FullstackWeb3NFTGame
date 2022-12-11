const { ethers, network } = require("hardhat")
const { networkConfig, developmentNets } = require("../helper-hardhat-config")

async function deployMocks() {
    if (developmentNets.includes(network.name)) {
        const VRFCoordinatorV2MockFactory = await ethers.getContractFactory(
            "VRFCoordinatorV2Mock"
        )
        const VRFCoordinatorV2MockContract =
            await VRFCoordinatorV2MockFactory.deploy(
                ethers.utils.parseEther(
                    networkConfig[network.config.chainId]["linkBaseFeeMock"]
                ),
                networkConfig[network.config.chainId]["gasPriceLinkMock"]
            )
        await VRFCoordinatorV2MockContract.deployed()
        return VRFCoordinatorV2MockContract
    }
}

// Testing executon
// deployMocks().then(function () {
// process.exitCode = 0
// }).catch((error) => {
// console.log(error)
// process.exitCode = 1
// })

module.exports = {
    deployMocks: deployMocks,
}
