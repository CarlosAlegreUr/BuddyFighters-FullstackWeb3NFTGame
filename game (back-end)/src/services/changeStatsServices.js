const {
    allowChangeOfStats,
    allowRandomStatsGeneration,
} = require("../blockchainScripts/changeStats");

const AddressTimer = require("../database/models/addressTimer");
const agenda = require("./agenda");

// Gives permission for 2.5min to playerAddress for generating random stats.
async function requestChange(playerAddress) {
    try {
        // Give permission to generate random stats
        await allowRandomStatsGeneration(playerAddress);

        // Try to find an existing timer for this address
        let addressTimer = await AddressTimer.findOne({
            address: playerAddress,
        });

        // If a timer doesn't exist, create a new one
        if (!addressTimer) {
            addressTimer = new AddressTimer({
                address: playerAddress,
                date: new Date(),
            });
            await addressTimer.save();
        }

        // After 5 minutes call disallowRandomStatsGeneration
        const waitTime = new Date();
        waitTime.setMinutes(waitTime.getMinutes() + 1);

        // Schedule the job to execute after waiting
        await agenda.schedule(waitTime, "updateRndmStatsAllowance", {
            playerAddress,
            rndmStatGenerationdate: addressTimer.date,
        });
    } catch (error) {
        throw error;
    }
}

// Generates a new URI with the new stats updated and sets a timer of 2.5minutes for the client to change them.
async function generateNewStatsURIAndAllowClient(
    playerAddress,
    nftId,
    rndmNumsReqId
) {
    try {
        const newTokenUri = await allowChangeOfStats(
            playerAddress,
            nftId,
            rndmNumsReqId,
            false
        );

        const addressTimer = await AddressTimer.findOne({
            address: playerAddress,
        });
        addressTimer.tokenUri = newTokenUri;
        await addressTimer.save();

        const waitTime = new Date();
        waitTime.setMinutes(waitTime.getMinutes() + 2.5);

        // Execute after 2.5 minutes.
        await agenda.schedule(waitTime, "updateStatsChangeAllowance", {
            playerAddress,
        });
        return newTokenUri;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    requestChange,
    generateNewStatsURIAndAllowClient,
};
