const { ethers, network, deployments } = require("hardhat");
const { networkConfig, developmentNets } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
    if (developmentNets.includes(network.name)) {
        // console.log("Deploying mocks...")
        const { deploy } = deployments;
        const { deployer } = await getNamedAccounts();
        const args = [
            ethers.parseEther(
                networkConfig[network.config.chainId]["linkBaseFeeMock"]
            ),
            networkConfig[network.config.chainId]["gasPriceLinkMock"],
        ];
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            args: args,
            log: true,
        });
    }
    console.log("-----------------------------------");
};

module.exports.tags = ["all", "mocks", "fundsManager", "buddyfighters"];
