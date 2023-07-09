const { ethers } = require("ethers");

async function verifySignature(address, message, signature) {
    try {
        const signingAddress = await ethers.verifyMessage(
            `${message}`,
            signature
        );
        return address === signingAddress;
    } catch (err) {
        throw err;
    }
}

module.exports = { verifySignature };
