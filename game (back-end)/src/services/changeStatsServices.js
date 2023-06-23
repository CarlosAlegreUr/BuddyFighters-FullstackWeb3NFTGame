const {
    allowChangeOfStats,
    allowRandomStatsGeneration,
} = require("../blockchainScripts/changeStats");

const NewUri = require("../database/models/newUris");

const agenda = require("./agenda");

// Gives permission for 10min to playerAddress for generating random stats.
async function requestChange(playerAddress) {
    try {
        // Give permission to generate random stats
        await allowRandomStatsGeneration(playerAddress);

        // After 10 minutes call disallowRandomStatsGeneration
        const waitTime = new Date();
        await waitTime.setMinutes(waitTime.getMinutes() + 10);

        // Schedule the job to execute after waiting
        await agenda.schedule(waitTime, "updateRndmStatsAllowance", {
            playerAddress,
        });
    } catch (error) {
        throw error;
    }
}

// Returns new token URI.
// Generates a new URI with the new stats updated and sets a timer of 2.5minutes for the client to change them.
async function generateNewURIAndAllowClient(
    playerAddress,
    nftId,
    rndmNumsReqId
) {
    try {
        const { newURI, prevURI } = await allowChangeOfStats(
            playerAddress,
            nftId,
            rndmNumsReqId,
            false
        );
        const newUriDatabase = new NewUri({
            clientAddress,
            newURI,
        });
        await newUriDatabase.save();

        const waitTime = new Date();
        await waitTime.setMinutes(waitTime.getMinutes() + 10);

        // Execute after 10 minutes.
        await agenda.schedule(waitTime, "updateStatsChangeAllowance", {
            playerAddress,
            nftId,
            newURI,
            prevURI,
        });
        return newURI;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    requestChange,
    generateNewURIAndAllowClient,
};
