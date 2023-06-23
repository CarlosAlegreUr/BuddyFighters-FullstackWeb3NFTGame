const { ethers, getNamedAccounts, network } = require("hardhat");
const { developmentNets } = require("../helper-hardhat-config");

module.exports = async function (addressToSendBalances) {
    let success = [false, "Some error occurred"];
    const onDevNet = developmentNets.includes(network.name);
    const blocksToWait = onDevNet ? 1 : 6;
    const { deployer } = await getNamedAccounts();

    try {
    } catch (error) {
        console.log("Error in withdrawal...");
        console.log("Error is ---> ", `${error}`);
        success[0] = false;
        success[1] = "Error in withdrawal";
        return success;
    }
    success[0] = true;
    success[1] = "";
    return success;
};
