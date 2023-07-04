const { ethers, getNamedAccounts } = require("hardhat");

async function getTickets(player) {
    try {
        const bfnftFightManager = await ethers.getContract(
            "BFNFTFightsManager"
        );
        const ticketsNum = await bfnftFightManager.getTicketsOf(player);
        return ticketsNum;
    } catch (err) {
        throw err;
    }
}

async function isFightActive(fightId) {
    try {
        const { deployer } = await getNamedAccounts();
        const bfnftFightManager = await ethers.getContract(
            "BFNFTFightsManager",
            deployer
        );
        const result = await bfnftFightManager.getIsFightActive(fightId);
        await txResponse.wait();
        return result;
    } catch (error) {
        throw error;
    }
}

async function allowStartFight(players, tokenIds, bets) {
    try {
        const { deployer } = await getNamedAccounts();
        const bfnftFightManager = await ethers.getContract(
            "BFNFTFightsManager",
            deployer
        );
        const types = [
            { type: "address[2]" },
            { type: "uint256[2]" },
            { type: "uint256[2]" },
        ];
        const inputs = [
            [players[0], players[1]],
            [tokenIds[0], tokenIds[1]],
            [bets[0], bets[1]],
        ];
        const coder = new ethers.AbiCoder();
        const abiEncodedInput = await coder.encode(types, inputs);
        const validInput = await ethers.keccak256(abiEncodedInput);
        let txResponse = await bfnftFightManager.allowInputs(
            players[0],
            [validInput],
            "startFight(address[2],uint256[2],uint256[2])",
            false
        );
        await txResponse.wait();
        txResponse = await bfnftFightManager.allowInputs(
            players[1],
            [validInput],
            "startFight(address[2],uint256[2],uint256[2])",
            false
        );
        await txResponse.wait();
    } catch (error) {
        throw error;
    }
}

async function disallowStartFight(players) {
    try {
        const { deployer } = await getNamedAccounts();
        const bfnftFightManager = await ethers.getContract(
            "BFNFTFightsManager",
            deployer
        );
        let txResponse = await bfnftFightManager.allowInputs(
            players[0],
            [],
            "startFight(address[2],uint256[2],uint256[2])",
            false
        );
        await txResponse.wait();
        txResponse = await bfnftFightManager.allowInputs(
            players[1],
            [],
            "startFight(address[2],uint256[2],uint256[2])",
            false
        );
        await txResponse.wait();
    } catch (error) {
        throw error;
    }
}

async function declareWinner(fightId, winnerAddress, players) {
    try {
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
    } catch (error) {
        throw error;
    }
}

async function withdrawAllowedFunds(sendToAddress) {
    try {
        const { deployer } = await getNamedAccounts();
        const bfnftFightManager = await ethers.getContract(
            "BFNFTFightsManager",
            deployer
        );
        const txResponse = await bfnftFightManager.withdrawAllowedFunds(
            sendToAddress
        );
        const txReceipt = await txResponse.wait();
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getTickets,
    isFightActive,
    allowStartFight,
    disallowStartFight,
    declareWinner,
    withdrawAllowedFunds,
};
