const { NFTStorage, File } = require("nft.storage");
const pinataSDK = require("@pinata/sdk");

const fs = require("fs");

const { ethers, getNamedAccounts, network } = require("hardhat");
const generateImage = require("../utils/generateNFTImage");
const { developmentNets } = require("../helper-hardhat-config");

const NFTStorage_API_KEY = process.env.NFT_STORAGE_API_KEY;
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;

module.exports = async function (nftName, saveOnBlockchain) {
    saveOnBlockchain = false; // TODO: Delete this line if saving metadata onChain ever implemented.
    let success = [false, "Some error occurred"],
        txResponse,
        txReceipt;
    const onDevNet = developmentNets.includes(network.name);
    const blocksToWait = onDevNet ? 1 : 6;
    const { deployer } = await getNamedAccounts();
    const buddyFightersContract = await ethers.getContract(
        "BuddyFightersNFT",
        deployer
    );

    const bfnftRndmWords = await ethers.getContract("BFNFTRndmWords", deployer);

    // Generating random numbers and stats.
    // FOR NOW RANDOMNESS IS NOT DECENTRALIZED
    let num1 = parseInt(((Math.random() * 1000) % 151) + 1),
        num2 = parseInt(((Math.random() * 1000) % 151) + 1),
        stats = [
            parseInt(((Math.random() * 1000) % 255) + 1),
            parseInt(((Math.random() * 1000) % 255) + 1),
            parseInt(((Math.random() * 1000) % 255) + 1),
            parseInt(((Math.random() * 1000) % 255) + 1),
            parseInt(((Math.random() * 1000) % 255) + 1),
        ];

    if (onDevNet) {
        let txResponse = await bfnftRndmWords.requestRandomNumbers(2);
        let txReceipt = await txResponse.wait(blocksToWait);
        const VRFCoordinatorV2MockContract = await ethers.getContract(
            "VRFCoordinatorV2Mock",
            deployer
        );
        const mockEventFilter = await VRFCoordinatorV2MockContract.filters
            .RandomWordsRequested;
        let txBlock = txReceipt.blockNumber;
        let query = await VRFCoordinatorV2MockContract.queryFilter(
            mockEventFilter,
            txBlock
        );
        let requestId = query[0].args.requestId;

        // Pokemon Nums
        txResponse =
            await VRFCoordinatorV2MockContract.fulfillRandomWordsWithOverride(
                await requestId.toNumber(),
                bfnftRndmWords.address,
                [parseInt(Math.random() * 1000), parseInt(Math.random() * 1000)]
            );
        txReceipt = await txResponse.wait();
        txBlock = txReceipt.blockNumber;
        query = await bfnftRndmWords.queryFilter(
            pokemonNumbersFilter,
            txBlock,
            txBlock
        );
        num1 = query[0].args.rndmNums[0];
        num2 = query[0].args.rndmNums[1];

        // Stats
        txResponse = await bfnftRndmWords.requestRandomNumbers(6);
        txReceipt = await txResponse.wait(blocksToWait);
        txBlock = txReceipt.blockNumber;

        query = await VRFCoordinatorV2MockContract.queryFilter(
            mockEventFilter,
            txBlock
        );
        requestId = query[0].args.requestId;
        txResponse =
            await VRFCoordinatorV2MockContract.fulfillRandomWordsWithOverride(
                await requestId.toNumber(),
                bfnftRndmWords.address,
                [
                    parseInt(Math.random() * 1000),
                    parseInt(Math.random() * 1000),
                    parseInt(Math.random() * 1000),
                    parseInt(Math.random() * 1000),
                    parseInt(Math.random() * 1000),
                    parseInt(Math.random() * 1000),
                ]
            );
        txReceipt = await txResponse.wait();
        txBlock = txReceipt.blockNumber;
        query = await bfnftRndmWords.queryFilter(
            pokemonStatsFilter,
            txBlock,
            txBlock
        );
        stats = query[0].args.rndmNums;
    } else {
        // NOT IMPLEMENTED YET
        // In testnet numbers are in event logs, loop trough them till finding or use TheGraph.
    }
    const rarity = await getRarity(num1, num2);

    let imageCIDorSvg;
    // Creates the pokemon image in ./utils/pokemonImages
    const imageObject = await generateImage(num1, num2);
    if (!saveOnBlockchain) {
        if (onDevNet || network.name == "goerli") {
            // Pinata service
            const pinata = new pinataSDK(PINATA_API_KEY, PINATA_API_SECRET);
            const readableStreamForFile = fs.createReadStream(
                "./utils/pokemonImages/pokemonImage"
            );
            const options = {
                pinataMetadata: {
                    name: `${num1}-${num2}`,
                },
                pinataOptions: {
                    cidVersion: 0,
                },
            };
            const response = await pinata.pinFileToIPFS(
                readableStreamForFile,
                options
            );
            console.log(response);
            imageCIDorSvg = "ipfs://" + response.IpfsHash;
        } else {
            // NFTStorage service
            imageCIDorSvg = new File([imageObject], `${num1}-${num2}.png`, {
                type: "image/png",
            });
        }
    } else {
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
        if (onDevNet || network.name == "goerli") {
            // Pinata service
            const pinata = new pinataSDK(PINATA_API_KEY, PINATA_API_SECRET);
            const options = {
                pinataMetadata: {
                    name: `${num1}-${num2}-JSON`,
                },
                pinataOptions: {
                    cidVersion: 0,
                },
            };
            const response = await pinata.pinJSONToIPFS(
                metadataJSONFormat,
                options
            );
            console.log(response);
            token_URI = "ipfs://" + response.IpfsHash;
        } else {
            // NFTStorage service
            // TODO: fix, doesnt work. Uploads stuff but can't read it from my browser at least...
            // Stores metadata.json using NFTStorage
            const client = new NFTStorage({ token: NFTStorage_API_KEY });
            const metadata = await client.store(metadataJSONFormat);
            token_URI = metadata.url; // also available metadata.ipnft (CID of tokenURI)
            // Until fixed it will display always same image.
            token_URI =
                "ipfs://bafkreieiy3v6rfcipx2nd2b3kf52lkhwkh4qeegfkqep227tdp632d5fmq";
            console.log(metadata);
        }
    } else {
        // NOT IMPLEMENTED BUT HERE ARE THE INSTRUCTIONS
        // BASE64 ENCODE THE JSON METADATA AND THATS THE TOKEN_URI
        success[0] = false;
        success[1] = "Saving NFTs on blockchain not implemented yet.";
        return success;
    }

    //Calling mint through bfnftRndmWords
    console.log("Trying to call mint...");
    try {
        txResponse = await buddyFightersContract.mintNFT(token_URI, deployer);
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

function getRarity(num1, num2) {
    rarity = 1;
    if (num1 == 144 || num1 == 145 || num1 == 146 || num1 == 150) {
        rarity *= 3;
    } else {
        if (num1 == 0 || num1 == 151) {
            rarity *= 5;
        }
    }
    if (num2 == 144 || num2 == 145 || num2 == 146 || num2 == 150) {
        rarity *= 3;
    } else {
        if (num2 == 0 || num2 == 151) {
            rarity *= 5;
        }
    }
    return rarity;
}
