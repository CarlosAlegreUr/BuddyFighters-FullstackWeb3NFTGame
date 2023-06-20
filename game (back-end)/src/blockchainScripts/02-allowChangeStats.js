const { ethers, getNamedAccounts } = require("hardhat");

const generateRandomNums = require("./00-generateRandomNums");
const {
    uploadMetadataJSONPinata,
    unpinByHashPinata,
} = require("../../utils/blockchainUtils/pinataUploads");
const { retrieveJsonFromIpfs } = require("../utils/getIPFSData");

module.exports = async function (clientAddress, tokenId, savedOnBlockchain) {
    let success = [false, "Some error occurred"];
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
};
