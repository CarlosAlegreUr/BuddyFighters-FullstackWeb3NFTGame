const mongoose = require('mongoose');

const fightSchema = new mongoose.Schema({
    fightId: {
        type: String,
        required: true,
        unique: true
    },
    player1: {
        type: String,
        required: true
    },
    player2: {
        type: String,
        required: true
    },
    nftId1: {
        type: Number,
        required: true
    },
    nftId2: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        required: true
    },
    winner: {
        type: String,
        default: null
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Fight = mongoose.model('Fight', fightSchema);

module.exports = Fight;
