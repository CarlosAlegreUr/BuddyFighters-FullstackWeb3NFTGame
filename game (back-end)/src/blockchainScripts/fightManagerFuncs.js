const { ethers, getNamedAccounts } = require("hardhat");

async function getTickets(player) {
    const bfnftFightManager = await ethers.getContract("BFNFTFightsManager");
    const ticketsNum = await bfnftFightManager.getTicketsOf(player);
    return ticketsNum;
}

async function startFight(players, tokenIds, bets) {
    const { deployer } = await getNamedAccounts();
    const bfnftFightManager = await ethers.getContract(
        "BFNFTFightsManager",
        deployer
    );
    // Check if address is owner of tokenID? Check if addresses have the money they are betting?
    const txResponse = await bfnftFightManager.startFight(
        players,
        tokenIds,
        bets
    );
}

async function returnBets(fightId, winnerAddress, players) {
    // Call return bets to players who bet but their rival didnt.
    // This is done with 1 callt o a function in the smart contract.
}

async function declareWinner(fightId, winnerAddress, players) {
    const { deployer } = await getNamedAccounts();
    const bfnftFightManager = await ethers.getContract(
        "BFNFTFightsManager",
        deployer
    );
    const txResponse = await bfnftFightManager.declareWinner(
        fightId,
        winnerAddress,
        players
    );
    const txReceipt = await txResponse.wait();
}

async function withdrawAllowedFunds(sendToAddress) {
    const { deployer } = await getNamedAccounts();
    const bfnftFightManager = await ethers.getContract(
        "BFNFTFightsManager",
        deployer
    );
    const txResponse = await bfnftFightManager.withdrawAllowedFunds(
        sendToAddress
    );
    const txReceipt = await txResponse.wait();
}

module.exports = {
    getTickets,
    startFight,
    returnBets,
    declareWinner,
    withdrawAllowedFunds,
};
