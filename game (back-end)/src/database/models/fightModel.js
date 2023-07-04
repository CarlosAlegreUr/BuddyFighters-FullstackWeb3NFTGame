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
    p1Ready: {
        type: Boolean,
        required: true,
    },
    p2Ready: {
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
