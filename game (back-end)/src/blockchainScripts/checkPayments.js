const { ethers, getNamedAccounts } = require("hardhat");

async function checkPayment(blockNum, targetAmount, clientAddress) {
    const { deployer } = await getNamedAccounts();
    const targetAddress = deployer.address;
    const provider = ethers.provider;

    // Get the block
    const block = await provider.getBlock(blockNum);

    // Loop through transactions in the block
    for (const txHash of block.transactions) {
        const tx = await provider.getTransaction(txHash);

        // Check if the transaction is sent to the target address and the amount is correct
        if (
            tx.to === targetAddress &&
            tx.from == clientAddress &&
            ethers.utils.formatEther(tx.value) === targetAmount
        ) {
            return true;
        }
    }
    return false;
}

module.exports = { checkPayment };
