const allowChangeStats = require("../scripts/02-allowChangeStats");
async function requestChange(playerAddress, nftId) {
    // Auth process
    const auth = true;
    // Call change stats script
    if (auth) {
        await allowChangeStats(playerAddress, nftId, false);
    }
}

module.exports = {
    requestChange,
};
