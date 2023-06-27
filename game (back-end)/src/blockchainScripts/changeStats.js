const { ethers, getNamedAccounts, network } = require("hardhat");
const { developmentNets } = require("../helper-hardhat-config");

const {
    geteRandomNumsLocalhost,
    getRandmNumsFromEvents,
} = require("./getRandomNums");
const {
    uploadMetadataJSONPinata,
    unpinByHashPinata,
} = require("../utils/blockchainUtils/pinataUploads");
const {
    retrieveJsonFromIpfs,
} = require("../utils/blockchainUtils/getIPFSData");

async function getTickets(player) {
    const BuddyFightersNFT = await ethers.getContract("BuddyFightersNFT");
    const ticketsNum = await BuddyFightersNFT.getTicketsOf(player);
    return ticketsNum;
}

async function allowRandomStatsGeneration(clientAddress) {
    try {
        const { deployer } = await getNamedAccounts();

        const bfnftRndmWordsContract = await ethers.getContract(
            "BFNFTRndmWords",
            deployer
        );

        let funcSig = "requestRandomNumbers(uint32)";
        let hash = await ethers.utils.solidityKeccak256(["string"], [funcSig]);
        const funcSelec = await hash.substring(0, 10);
        await bfnftRndmWordsContract.callAllowFuncCallsFor(
            clientAddress,
            [funcSelec],
            false
        );
    } catch (error) {
        throw error;
    }
}

async function disallowRandomStatsGeneration(clientAddress) {
    try {
        const { deployer } = await getNamedAccounts();

        const bfnftRndmWordsContract = await ethers.getContract(
            "BFNFTRndmWords",
            deployer
        );

        await bfnftRndmWordsContract.callAllowFuncCallsFor(
            clientAddress,
            [],
            false
        );
    } catch (error) {
        throw error;
    }
}

// Gets the new stats generated from blockchain, pins new metadata in IPFS
// and gives permission to client to change their NFT to the new URI.
// Returns new URI and the previous one
async function allowChangeOfStats(
    clientAddress,
    tokenId,
    rndmReqId,
    savedOnBlockchain
) {
    try {
        const { deployer } = await getNamedAccounts();

        const buddyFightersNFTContract = await ethers.getContract(
            "BuddyFightersNFT",
            deployer
        );

        // Check if front-end caller is actually the owner of the token ID.
        const owner = await buddyFightersNFTContract.ownerOf(tokenId);
        if (owner == clientAddress) {
            const token_URI = await buddyFightersNFTContract.tokenURI(tokenId);
            const token_Hash = await token_URI.replace("ipfs://", "");

            const onDevNet = await developmentNets.includes(network.name);
            const { stats } = onDevNet
                ? await geteRandomNumsLocalhost(false, true, rndmReqId)
                : await getRandmNumsFromEvents(rndmReqId, clientAddress);

            let newToken_URI;
            if (savedOnBlockchain) {
                // TODO:
                // NOT IMPLEMENTED BUT HERE ARE THE INSTRUCTIONS
                // GET JSON FILE FROM DECODING TOKEN URI
                // SAVE RANDOM STATS ON METADATA
                // ENCODE BASE64 JSON AND THATS THE NEW TOKEN_URI
                success[0] = false;
                success[1] =
                    "Saving changedStats on blockchain not implemented yet.";
                return success;
            } else {
                // Create new metadata
                // Retrieve old JSON from IPFS
                let metadataJSON = await retrieveJsonFromIpfs(token_Hash);

                // Change stats values
                for (let i = 3; i <= 8; i++) {
                    metadataJSON.attributes[i].value = stats[i - 3];
                }

                // Pin new metadata
                newToken_URI = await uploadMetadataJSONPinata(metadataJSON);

                // Give client permission to call changeStats() with input value newToken_URI
                validInputs = await ethers.utils.defaultAbiCoder.encode(
                    ["string", "uint256"],
                    [newToken_URI, tokenId]
                );
                validInputs = await ethers.utils.keccak256(validInputs);
                await buddyFightersNFTContract.allowInputs(
                    clientAddress,
                    [validInputs],
                    "changeStats(string,uint256)",
                    false
                );
                return { newURI: newToken_URI, prevURI: token_URI };
            }
        }
    } catch (error) {
        throw error;
    }
}

// Resets the inputs clientAddress can use un changeStats() from the smart contract to none.
async function disallowStatsChange(clientAddress) {
    try {
        const { deployer } = await getNamedAccounts();
        const buddyFightersNFTContract = await ethers.getContract(
            "BuddyFightersNFT",
            deployer
        );

        // Gives client permission to call changeStats() with no input values.
        await buddyFightersNFTContract.allowInputs(
            clientAddress,
            [],
            "changeStats(string,uint256)",
            false
        );
    } catch (error) {
        throw error;
    }
}

async function getTokenUri(tokenId) {
    try {
        const { deployer } = await getNamedAccounts();

        const buddyFightersNFTContract = await ethers.getContract(
            "BuddyFightersNFT",
            deployer
        );

        const token_URI = await buddyFightersNFTContract.tokenURI(tokenId);
        return token_URI;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getTickets,
    allowRandomStatsGeneration,
    allowChangeOfStats,
    disallowRandomStatsGeneration,
    disallowStatsChange,
    getTokenUri,
};
