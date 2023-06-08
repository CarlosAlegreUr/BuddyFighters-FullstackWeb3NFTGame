const { ethers, getNamedAccounts, network } = require("hardhat");
const { developmentNets } = require("../helper-hardhat-config");

// TO BE IMPLEMENTED
module.exports = async function (
    saveOnBlockchain = false,
    clientAddress,
    tokenId
) {
    saveOnBlockchain = false; // TODO: Delete this line if saving metadata onChain ever implemented.
    let success = [false, "Some error occurred"];
    const onDevNet = developmentNets.includes(network.name);
    const blocksToWait = onDevNet ? 1 : 6;
    const { deployer } = await getNamedAccounts();

    const buddyFightersNFTContract = await ethers.getContract(
        "BuddyFightersNFT",
        deployer
    );

    const token_URI = await buddyFightersNFTContract.tokenURI(tokenId);

    let newToken_URI;
    if (saveOnBlockchain) {
        // NOT IMPLEMENTED BUT HERE ARE THE INSTRUCTIONS
        // GET TOKEN URI FROM BUDDYFIGHTERS CONTRACT
        // GET JSON FILE FROM TOKEN URI
        // IF TOKEN IS A CID, GET IMAGE
        // CONVERT IMAGE TO SVG AND BASE64 ENCODE IT
        // SAVE ENCODED IMAGE IN METADATA
        // GENERATE RANDOM STATS CALLING INDEPENDENT FUND MANAGER
        // SAVE RANDOM STATS ON METADATA
        // ENCODE BASE64 JSON AND THATS THE NEW TOKEN_URI
        success[0] = false;
        success[1] = "Saving changedStats on blockchain not implemented yet.";
        return success;
    } else {
        // TODO:
        // SEARCH IN PINATA OR NFTSTORAGE PINNED FILE THAT MATHCES TOKENID
        // GET JSON DATA
        // COPY PASTE JSON METADATA BUT WITH NEW STATS
        // PIN NEW METADATA TO PINATA OR NFTSTORAGE
        // UNPIN (DELETE) OLD METADATA FROM PINATA OR NFTSTOAGE
    }

    // Calling changing stats function
    try {
        // Get function signature of changeStats() and also keckack input --> new token URI
        const txResponse = await buddyFightersNFTContract.allowInputsFor(
            clientAddress,
            tokenId,
            false
        );
    } catch (error) {
        console.log("ERROR IN CHANGING STATS SCRIPT...");
        console.log("----------------------------");
        console.log(error);
        success[0] = false;
        success[1] =
            "Error in changing stats transaction, error recieved ---> " +
            `${error}`;
        return success;
    }
    const txReceipt = await txResponse.wait(blocksToWait);
    success[0] = true;
    success[1] = "";
    return success;
};
