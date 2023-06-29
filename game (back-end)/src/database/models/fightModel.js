const mongoose = require("mongoose");

const fightSchema = new mongoose.Schema({
    fightId: {
        type: String,
        required: true,
        unique: true,
    },
    player1: {
        type: String,
        required: true,
    },
    player2: {
        type: String,
        required: true,
    },
    p1Life: {
        type: Number,
        required: true,
    },
    p2Life: {
        type: Number,
        required: true,
    },
    p1Moved: {
        type: Boolean,
        required: true,
    },
    p2Moved: {
        type: Boolean,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

const Fight = mongoose.model("Fight", fightSchema);

module.exports = Fight;
