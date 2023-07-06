const mintNFT = require("./mint");
const { ethers, getNamedAccounts, network } = require("hardhat");
const {
    declareWinner,
    getFightId,
    withdrawAllowedFunds,
} = require("./fightManagerFuncs");

// Delay function.
function delay(t) {
    return new Promise((resolve) => setTimeout(resolve, t));
}

async function callMint(onBlockchain, quantity) {
    // Loop and call mintNFT with a delay between each call.
    for (let i = 0; i < quantity; i++) {
        await mintNFT(onBlockchain);
        await delay(3500); // Delay for 3.5 seconds
    }
}

// Mints 2 NFTs and transfer them to the first 2 hardhat addresses.
// Nft Id 0 => address 1 && Nft Id 1 => address 2
async function callMinting() {
    const numToMint = 2;
    await callMint(false, numToMint);
    const { deployer, client1, client2 } = await getNamedAccounts();
    const buddyFightersContract = await ethers.getContract(
        "BuddyFightersNFT",
        deployer
    );
    let txResponse;
    txResponse = await buddyFightersContract.transferFrom(deployer, client1, 0);
    let txReceipt = await txResponse.wait();

    txResponse = await buddyFightersContract.transferFrom(deployer, client2, 1);
    txReceipt = await txResponse.wait();
    console.log("Ownership transfered.");
}

const execute = "withdraw";
async function exe() {
    const { deployer, client1, client2 } = await getNamedAccounts();
    switch (execute) {
        case "mint":
            await callMinting();
            break;
        case "getFightId":
            console.log(await getFightId([client1, client2], [0, 1]));
            break;
        case "declareWinner":
            const fId = await getFightId([client1, client2], [0, 1]);
            await declareWinner(fId, client1, [client1, client2]);
            break;
        case "withdraw":
            await withdrawAllowedFunds(deployer);
            break;
        default:
            console.log("Please specify a valid flag!");
    }
}

exe();
