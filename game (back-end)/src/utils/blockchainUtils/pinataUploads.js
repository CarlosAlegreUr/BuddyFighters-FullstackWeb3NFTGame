const pinataSDK = require("@pinata/sdk");

const fs = require("fs");

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;

async function uploadNFTImagePinata(num1, num2) {
    // Pinata service (if prefered open source version you might use NFTStorage services instead)
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
    const response = await pinata.pinFileToIPFS(readableStreamForFile, options);
    console.log(response);
    const imageCIDorSvg = "ipfs://" + response.IpfsHash;
    return imageCIDorSvg;
}

async function uploadMetadataJSONPinata(metadataJSONFormat) {
    const pinata = new pinataSDK(PINATA_API_KEY, PINATA_API_SECRET);
    const options = {
        pinataMetadata: {
            name: `${metadataJSONFormat.attributes[0].value}-${metadataJSONFormat.attributes[1].value}-JSON`,
        },
        pinataOptions: {
            cidVersion: 0,
        },
    };
    const response = await pinata.pinJSONToIPFS(metadataJSONFormat, options);
    console.log(response);
    const token_URI = "ipfs://" + response.IpfsHash;
    return token_URI;
}

async function unpinByHashPinata(hash) {
    const pinata = new pinataSDK(PINATA_API_KEY, PINATA_API_SECRET);
    await pinata.unpin(hash);
    console.log("Deleted pin with hash: " + hash);
}

module.exports = {
    uploadNFTImagePinata,
    uploadMetadataJSONPinata,
    unpinByHashPinata,
};
