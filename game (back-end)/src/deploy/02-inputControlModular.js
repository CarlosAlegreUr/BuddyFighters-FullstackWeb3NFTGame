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

    // console.log("Deploying InputControlModular...")

    const args = [];

    await deploy("InputControlModular", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: nOfConfitmations,
    });

    const InputControlModularContract = await deployments.get(
        "InputControlModular"
    );
    console.log(
        "InputControlModularContract deployed at ",
        `${InputControlModularContract.address}`
    );
    await updateFrontEndData(
        InputControlModularContract,
        "InputControlModular"
    );

    // A second imput control for fights
    await deploy("InputControlModularFight", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: nOfConfitmations,
    });
    const InputControlModularContractFight = await deployments.get(
        "InputControlModularFight"
    );
    console.log(
        "InputControlModularContractFight deployed at ",
        `${InputControlModularContractFight.address}`
    );
    await updateFrontEndData(
        InputControlModularContractFight,
        "InputControlModularFight"
    );

    // Verifies on Etherscan if deployed on Goerli.
    if (
        process.env.ETHERSCAN_API_KEY &&
        network.config.chainId == networks.goerli.chainId
    ) {
        await verify(InputControlModularContract.address, args);
        console.log("Verified on Etherscan!");
    }

    // Only run when testing in local network
    if (process.env.TESTING_ON_LOCAL === "true") {
        await updateFrontEndData(
            InputControlModularContract,
            "InputControlModular",
            FRONT_END_CONTRACTS_TESTING_FILE
        );
    }
    console.log("-----------------------------------");
};

module.exports.tags = ["all", "inputcontrolmodular"];
