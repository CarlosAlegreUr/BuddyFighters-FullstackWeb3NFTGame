const { ethers, getNamedAccounts } = require("hardhat");

const generateRandomNums = require("./00-generateRandomNums");
const {
    uploadMetadataJSONPinata,
    unpinByHashPinata,
} = require("../utils/pinataUploads");

module.exports = async function (tokenId, savedOnBlockchain) {
    let success = [false, "Some error occurred"];
    const { deployer } = await getNamedAccounts();

    const buddyFightersNFTContract = await ethers.getContract(
        "BuddyFightersNFT",
        deployer
    );

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
        success[1] = "Saving changedStats on blockchain not implemented yet.";
        return success;
    } else {
        // Create new metadata
        // Retrieve old JSON from IPFS
        const prevMetadataJSON = {};
        const newMetadataJSON = {};

        // Unpin old metadata
        await unpinByHashPinata(token_Hash);

        // Pin new metadata
        newToken_URI = await uploadMetadataJSONPinata(newMetadataJSON);
        return newToken_URI;
    }
};
