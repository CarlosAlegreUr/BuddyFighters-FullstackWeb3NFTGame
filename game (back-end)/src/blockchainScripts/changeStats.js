const { ethers, getNamedAccounts } = require("hardhat");

const generateRandomNums = require("./generateRandomNums");
const {
    uploadMetadataJSONPinata,
    unpinByHashPinata,
} = require("../utils/blockchainUtils/pinataUploads");
const {
    retrieveJsonFromIpfs,
} = require("../utils/blockchainUtils/getIPFSData");

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

// Returns the stats values if found, if not found returns a boolean with the value false.
async function getRandomStatsGenerated(clientAddress, requestId) {
    try {
        // Locally parses blocks
    } catch (error) {
        throw error;
    }
}

// Checks the new stats generated, pins them in IPFS and then updates the blockchain URI.
async function allowChangeOfStats(
    clientAddress,
    tokenId,
    /*rndmReqId,*/
    savedOnBlockchain
) {
    try {
        const { deployer } = await getNamedAccounts();

        const buddyFightersNFTContract = await ethers.getContract(
            "BuddyFightersNFT",
            deployer
        );

        // Check if front-end caller is actually the owner of the token ID.
        // Who is calling is provided securely by Metamask, see more on the services folder changeStats script
        const owner = await buddyFightersNFTContract.ownerOf(tokenId);
        if (owner == clientAddress) {
            const token_URI = await buddyFightersNFTContract.tokenURI(tokenId);
            const token_Hash = await token_URI.replace("ipfs://", "");
            const { stats } = await generateRandomNums(false, true);

            // const stats = await getRandomStatsGeneratedTheGraph(rndmReqId, clientAddress)

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

                console.log("Old metadata: ");
                console.log(metadataJSON);

                // Change stats values
                for (let i = 3; i <= 8; i++) {
                    metadataJSON.attributes[i].value = stats[i - 3];
                }

                console.log("New metadata: ");
                console.log(metadataJSON);

                // Unpin old metadata
                await unpinByHashPinata(token_Hash);

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

                return newToken_URI;
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

// Check if some stats changed from a previous value.
async function getTokenUri(nftId) {
    try {
        const { deployer } = await getNamedAccounts();

        const buddyFightersNFTContract = await ethers.getContract(
            "BuddyFightersNFT",
            deployer
        );

        const currentUri = await buddyFightersNFTContract.tokenURI(nftId);
        return currentUri;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    allowRandomStatsGeneration,
    allowChangeOfStats,
    disallowRandomStatsGeneration,
    disallowStatsChange,
    getTokenUri,
    getRandomStatsGenerated,
};
