const jwt = require("jsonwebtoken");
const { verifySignature } = require("../blockchainScripts/verifySignature");
const agenda = require("./agenda");

const BlockchainAuthNonce = require("../database/models/blockchainAuthNonceModel");

async function generateNonce() {
    try {
        const nonceCreated = await Math.floor(Math.random() * 100000000000);
        const newNonce = new BlockchainAuthNonce({
            nonce: nonceCreated,
        });
        await newNonce.save();

        const waitTime = new Date();
        await waitTime.setSeconds(waitTime.getSeconds() + 35);

        // Execute after 1 minute.
        await agenda.schedule(waitTime, "deleteNonce", {
            nonceCreated,
        });
        const nonceCreatedFinal =
            "BuddyFighters Log In: " + nonceCreated.toString();
        return nonceCreatedFinal;
    } catch (err) {
        throw err;
    }
}

async function checkNonceEmitted(nonce) {
    try {
        const exctractionString = await nonce.replace(
            "BuddyFighters Log In: ",
            ""
        );
        const nonceExtracted = await parseInt(exctractionString);
        const deletedNonce = await BlockchainAuthNonce.deleteOne({
            nonce: nonceExtracted,
        });
        if (deletedNonce) return true;
        else return false;
    } catch (error) {
        throw error;
    }
}

async function authUser(address, nonce, sig) {
    try {
        return await verifySignature(address, nonce, sig);
    } catch (err) {
        throw err;
    }
}

async function generateJWT(address, secret) {
    try {
        const payload = { address };
        const options = { expiresIn: "12h" };
        const token = await jwt.sign(payload, secret, options);
        return token;
    } catch (err) {
        throw err;
    }
}

module.exports = { generateNonce, checkNonceEmitted, authUser, generateJWT };
