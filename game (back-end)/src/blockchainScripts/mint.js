const { ethers, getNamedAccounts, network } = require("hardhat");
const { requAndGenRandomTesting } = require("./getRandomNums");
const generateImage = require("../utils/generateNFTImage");
const {
    uploadNFTImagePinata,
    uploadMetadataJSONPinata,
} = require("../utils/blockchainUtils/pinataUploads");
const { getRarity, mixNames } = require("../utils/nftTraitsUtils");
const { developmentNets } = require("../helper-hardhat-config");

module.exports = async function (saveOnBlockchain) {
    saveOnBlockchain = false; // TODO: Delete this line if saving metadata onChain ever implemented.
    let success = [false, "Some error occurred"],
        txResponse;
    const onDevNet = developmentNets.includes(network.name);
    const blocksToWait = onDevNet ? 1 : 6;
    const { deployer } = await getNamedAccounts();
    const buddyFightersContract = await ethers.getContract(
        "BuddyFightersNFT",
        deployer
    );

    if (!onDevNet && network.name != "goerli") {
        success[0] = false;
        success[1] =
            "This network is not supported, only Goerli or Localhost networks are.";
        return success;
    }

    // Generating random numbers and stats.
    const { num1, num2, stats } = await requAndGenRandomTesting(true, true);

    // Assigning more traits from random values generated
    const nftName = await mixNames(num1, num2);
    const rarity = await getRarity(num1, num2);

    let imageCIDorSvg;
    // Creates the pokemon image in ./utils/pokemonImages
    await generateImage(num1, num2);
    if (!saveOnBlockchain) {
        // Using => Pinata service
        imageCIDorSvg = await uploadNFTImagePinata(num1, num2);
    } else {
        // TODO:
        // NOT IMPLEMENTED BUT HERE ARE THE INSTRUCTIONS
        // CONVERT IMAGE TO SVG AND BASE64 ENCODE IT FOR USING LESS CONTRACT STORAGE
        success[0] = false;
        success[1] = "Saving NFTs on blockchain not implemented yet.";
        return success;
    }

    const metadataJSONFormat = {
        name: nftName,
        description: "A BuddyFighet! So legendary, so fighter.",
        image: imageCIDorSvg,
        attributes: [
            {
                trait_type: "Pokemon Number 1",
                value: `${num1}`,
            },
            {
                trait_type: "Pokemon Number 2",
                value: `${num2}`,
            },
            {
                trait_type: "Rarity (the higher, the rarer)",
                value: rarity,
            },
            {
                trait_type: "HP",
                value: stats[0],
            },
            {
                trait_type: "ATTCK",
                value: stats[1],
            },
            {
                trait_type: "DEF",
                value: stats[2],
            },
            {
                trait_type: "SPCL ATTCK",
                value: stats[3],
            },
            {
                trait_type: "SPCL DEF",
                value: stats[4],
            },
            {
                trait_type: "Velocity",
                value: stats[5],
            },
        ],
    };

    let token_URI;
    if (!saveOnBlockchain) {
        // Using => Pinata service
        token_URI = await uploadMetadataJSONPinata(metadataJSONFormat);
    } else {
        // TODO:
        // NOT IMPLEMENTED BUT HERE ARE THE INSTRUCTIONS
        // BASE64 ENCODE THE JSON METADATA AND THATS THE TOKEN_URI
        success[0] = false;
        success[1] = "Saving NFTs on blockchain not implemented yet.";
        return success;
    }

    //Calling mint through bfnftRndmWords
    console.log("Trying to call mint...");
    try {
        // Input allowance must be deactivated for this to work.
        txResponse = await buddyFightersContract.mintNft(token_URI);
        console.log(
            "Transaction minitng sent... Now waiting for confirmations..."
        );
        txReceipt = await txResponse.wait(blocksToWait);
    } catch (error) {
        console.log("ERROR IN MINTING SCRIPT...");
        console.log("----------------------------");
        console.log(error);
        success[0] = false;
        success[1] =
            "Error in minting transaction, error recieved ---> " + `${error}`;
        return success;
    }
    success[0] = true;
    success[1] = "";
    console.log("Successful minitng!");
    return success;
};
