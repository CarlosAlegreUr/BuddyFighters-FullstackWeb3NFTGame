const dotenv = require("dotenv");
dotenv.config();

const Agenda = require("agenda");

const NewUri = require("../database/models/newUriModel");
const BlockchainAuthNonce = require("../database/models/blockchainAuthNonceModel");

const {
    disallowStatsChange,
    disallowRandomStatsGeneration,
    getTokenUri,
} = require("../blockchainScripts/changeStats");

const { unpinByHashPinata } = require("../utils/blockchainUtils/pinataUploads");

const agenda = new Agenda({ db: { address: process.env.DATABASE_URL } });

// Handling nonce emitted.
agenda.define("deleteNonce", async (job) => {
    const { nonceCreated } = job.attrs.data;
    await BlockchainAuthNonce.deleteOne({ nonce: nonceCreated });
});

// After the time has passed it deletes the object from database and the permissions from blockchain.
agenda.define("updateRndmStatsAllowance", async (job) => {
    const { playerAddress } = job.attrs.data;
    await disallowRandomStatsGeneration(playerAddress);
});

// After giving stats change permissions and time passed, no matter if changed or not, client loses capability of doing so.
agenda.define("updateStatsChangeAllowance", async (job) => {
    const { playerAddress, nftId, newURI, prevURI } = job.attrs.data;
    await disallowStatsChange(playerAddress);

    // If client didnt change URI, unpin new one, if he did, unpin previous one.
    const current_token_URI = await getTokenUri(nftId);
    let token_Hash;
    if (current_token_URI != prevURI) {
        token_Hash = await prevURI.replace("ipfs://", "");
    } else {
        token_Hash = await newURI.replace("ipfs://", "");
    }
    await unpinByHashPinata(token_Hash);
    await NewUri.deleteOne({ address: playerAddress });
});

(async () => {
    await agenda.start();
})();

module.exports = agenda;
