const Agenda = require("agenda");
const AddressTimer = require("../database/models/addressTimer");

const {
    disallowStatsChange,
    disallowRandomStatsGeneration,
} = require("../blockchainScripts/changeStats");

const agenda = new Agenda();

// After the time has passed it deletes the object from database and the permissions from blockchain.
agenda.define("updateRndmStatsAllowance", async (job) => {
    const { playerAddress, rndmStatGenerationdate } = job.attrs.data;
    await disallowRandomStatsGeneration(playerAddress);
    await AddressTimer.deleteOne({
        address: playerAddress,
        date: rndmStatGenerationdate,
    });
});

// After giving stats change permissions and time passed, no matter if changed or not, client loses capability of doing so.
agenda.define("updateStatsChangeAllowance", async (job) => {
    const { playerAddress } = job.attrs.data;
    await disallowStatsChange(playerAddress);
    await AddressTimer.deleteOne({ address: playerAddress });
});

(async () => {
    await agenda.start();
})();

module.exports = agenda;
