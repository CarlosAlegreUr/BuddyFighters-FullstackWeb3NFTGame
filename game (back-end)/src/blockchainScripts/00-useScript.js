const mintNFT = require("./mint");
const { ethers, getNamedAccounts, network } = require("hardhat");

const {
    requAndGenRandomTesting,
} = require("../blockchainScripts/getRandomNums");

// Delay function.
function delay(t) {
    return new Promise((resolve) => setTimeout(resolve, t));
}

// We can accept a number for the quantity of NFTs to mint.
async function callMint(onBlockchain, quantity) {
    // Loop and call mintNFT with a delay between each call.
    for (let i = 0; i < quantity; i++) {
        await mintNFT(onBlockchain);
        await delay(4500); // Delay for 4.5 seconds
    }
}

const numToMint = 2;
async function callMinting() {
    const { deployer } = await getNamedAccounts();
    const buddyFightersContract = await ethers.getContract(
        "BuddyFightersNFT",
        deployer
    );
    txResponse = await buddyFightersContract.setInputChekcer(false);
    txReceipt = await txResponse.wait(1);

    // Now we can specify how many NFTs we want to mint.
    await callMint(false, numToMint);

    txResponse = await buddyFightersContract.transferFrom(
        deployer,
        "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        1
    );
    txReceipt = await txResponse.wait();
    console.log("Ownership transfered.");
}

callMinting();

// exe();
async function exe() {
    await getRandomStatsGenerated();
    // await changeStats("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", 0, false);
}

// async function callWithdrawal() {
// const { client2 } = await getNamedAccounts();
// await withdrawal(client2);
// }

// callWithdrawal()
