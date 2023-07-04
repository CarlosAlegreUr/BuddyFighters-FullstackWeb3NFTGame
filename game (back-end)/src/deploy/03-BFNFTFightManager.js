const { network } = require("hardhat");
const { networks } = require("../hardhat.config");
const { developmentNets } = require("../helper-hardhat-config");
require("dotenv").config();

const { verify } = require("../utils/blockchainUtils/etherscanVerifyContract");
const {
    updateFrontEndData,
    FRONT_END_CONTRACTS_TESTING_FILE,
} = require("../blockchainScripts/updateFrontEndLocal");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    let inDevNet = developmentNets.includes(network.name);
    const nOfConfitmations = inDevNet ? 1 : 6;

    // console.log("Deploying BFNFT...")
    const inputControlModularContract = await ethers.getContract(
        "InputControlModularFight",
        deployer
    );

    const args = [await inputControlModularContract.getAddress()];

    await deploy("BFNFTFightsManager", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: nOfConfitmations,
    });

    const BFNFTFightsManagerContract = await deployments.get(
        "BFNFTFightsManager"
    );
    console.log(
        "BFNFTFightsManagerContract deployed at ",
        `${BFNFTFightsManagerContract.address}`
    );
    await inputControlModularContract.setAdmin(
        BFNFTFightsManagerContract.address
    );

    await updateFrontEndData(BFNFTFightsManagerContract, "BFNFTFightsManager");

    // Verifies on Etherscan if deployed on Goerli.
    if (
        process.env.ETHERSCAN_API_KEY &&
        network.config.chainId == networks.goerli.chainId
    ) {
        await verify(BFNFTFightsManagerContract.address, args);
        console.log("Verified on Etherscan!");
    }

    // Only run when testing in local network
    if (process.env.TESTING_ON_LOCAL === "true") {
        await updateFrontEndData(
            BFNFTFightsManagerContract,
            "BFNFTFightsManager",
            FRONT_END_CONTRACTS_TESTING_FILE
        );
    }
    console.log("-----------------------------------");
};

module.exports.tags = ["all", "BFNFTFightsManager"];
