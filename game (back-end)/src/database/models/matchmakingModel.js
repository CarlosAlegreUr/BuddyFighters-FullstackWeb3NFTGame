const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema({
    playerAddress: {
        type: String,
        required: true,
        unique: true,
    },
    nftId: {
        type: Number,
        required: true,
    },
    betAmount: {
        type: Number,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    accepted: [
        {
            opponentAddress: String,
            offeredBetAmount: Number,
            opponentNftId: Number,
        },
    ],
});

const Challenge = mongoose.model("Challenge", challengeSchema);

module.exports = Challenge;
