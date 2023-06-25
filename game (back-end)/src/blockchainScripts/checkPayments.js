const { ethers } = require("hardhat");
const constants = require("../businessConstants.json");

async function checkPayment(blockNum, targetAmount, clientAddress) {
    const targetAddress = constants.addresses.paymentsAddress;
    const provider = ethers.provider;

    // Get the block
    const block = await provider.getBlock(blockNum);

    // Loop through transactions in the block
    for (const txHash of block.transactions) {
        const tx = await provider.getTransaction(txHash);
        const payment = await ethers.utils.formatEther(tx.value);

        // Check if the transaction is sent to the target address and the amount is correct
        if (
            tx.to == targetAddress &&
            tx.from == clientAddress &&
            payment == targetAmount
        ) {
            return true;
        }
    }
    return false;
}

module.exports = { checkPayment };
