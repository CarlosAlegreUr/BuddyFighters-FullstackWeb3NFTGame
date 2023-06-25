const mongoose = require("mongoose");

// Define the schema for the BlockchainAuthNonce model
const blockchainAuthNonceSchema = new mongoose.Schema({
    nonce: {
        type: Number,
        required: true,
        unique: true,
    },
});

// Create the BlockchainAuthNonce model
const BlockchainAuthNonce = mongoose.model(
    "BlockchainAuthNonce",
    blockchainAuthNonceSchema
);

module.exports = BlockchainAuthNonce;
