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

async function getFightId(players, tokenIds) {
    const types = [
        { type: "address" },
        { type: "address" },
        { type: "uint256" },
        { type: "uint256" },
    ];
    const inputs = [players[0], players[1], tokenIds[0], tokenIds[1]];
    const coder = new ethers.AbiCoder();
    const abiEncodedInput = await coder.encode(types, inputs);
    const fightId = await ethers.keccak256(abiEncodedInput);
    return fightId;
}

async function isFightActive(fightId) {
    try {
        const { deployer } = await getNamedAccounts();
        const bfnftFightManager = await ethers.getContract(
            "BFNFTFightsManager",
            deployer
        );
        const fightState = await bfnftFightManager.getIsFightActive(fightId);
        return fightState;
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
        const bet1Eth = await ethers.parseEther(await bets[0].toString());
        const bet2Eth = await ethers.parseEther(await bets[1].toString());
        const inputs = [
            [players[0], players[1]],
            [tokenIds[0], tokenIds[1]],
            [bet1Eth, bet2Eth],
        ];
        const coder = new ethers.AbiCoder();
        const abiEncodedInput = await coder.encode(types, inputs);
        const validInput = await ethers.keccak256(abiEncodedInput);
        console.log("VALID INPUT SET");
        console.log(validInput);
        console.log(typeof validInput);
        console.log(typeof players[0]);
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
        console.log("Permissions given in blockchain...");
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
        console.log("Disallowing fight pemissions in blockchain...");
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
    getFightId,
    isFightActive,
    allowStartFight,
    disallowStartFight,
    declareWinner,
    withdrawAllowedFunds,
};
