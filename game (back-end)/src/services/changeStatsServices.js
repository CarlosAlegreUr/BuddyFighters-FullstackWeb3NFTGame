const {
    allowChangeOfStats,
    allowRandomStatsGeneration,
    disallowStatsChange,
    disallowRandomStatsGeneration,
    getTokenUri,
} = require("../blockchainScripts/changeStats");

const AddressTimer = require("../database/models/addressTimer");

const connectDB = require("../database/connect");

async function callConnectDB() {
    await connectDB();
}

callConnectDB();

// Gives permission for 2.5min to playerAddress for generating random stats.
async function requestChange(playerAddress) {
    // Give permission to generate random stats
    await allowRandomStatsGeneration(playerAddress);

    const addressTimer = new AddressTimer({
        address: playerAddress,
        date: new Date(),
    });
    await addressTimer.save();

    // After 2.5 minutes call disallowRandomStatsGeneration
    const waitTime = 1000 * 60 * 5;
    // Timeout function to execute after waiting
    setTimeout(
        updateRndmStatsAllowance.bind(null, playerAddress, addressTimer.date),
        waitTime
    );
}

// Generates a new URI with the new stats updated and sets a timer of 2.5minutes for the client to change them.
async function generateNewStatsURIAndAllowClient(
    playerAddress,
    nftId,
    rndmNumsReqId
) {
    const newTokenUri = await allowChangeOfStats(
        playerAddress,
        nftId,
        rndmNumsReqId,
        false
    );

    const addressTimer = await AddressTimer.findOne({ address: playerAddress });
    addressTimer.tokenUri = newTokenUri;
    await addressTimer.save();

    const waitTime = 1000 * 60 * 2.5;
    // Timeout function to execute after waiting
    setTimeout(checkStatsChanged.bind(null, playerAddress), waitTime);

    return newTokenUri;
}

// Checks if the user has changed stats on time.
// If done so deletes timer from database.
// If not it disallows client to change stats and deletes timer from database.
async function checkStatsChanged(nftId) {
    const uri = await getTokenUri(nftId);
    const addressTimer = await AddressTimer.findOne({ tokenUri: uri });
    const prevUrl = addressTimer ? addressTimer.tokenUri : "";

    const changed = await checkStatsChanged(nftId, prevUrl);
    if (!changed) {
        await disallowStatsChange(addressTimer.address);
    }
    // Delete timer object
    await AddressTimer.deleteOne({ address: addressTimer.address });

    return changed;
}

// After the time has passed it deletes the object from database and the permissions from blockchain.
async function updateRndmStatsAllowance(playerAddress, rndmStatGenerationdate) {
    await disallowRandomStatsGeneration(playerAddress);
    await AddressTimer.deleteOne({
        address: playerAddress,
        date: rndmStatGenerationdate,
    });
}

module.exports = {
    requestChange,
    generateNewStatsURIAndAllowClient,
    checkStatsChanged,
};
