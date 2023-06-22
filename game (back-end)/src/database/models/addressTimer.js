const mongoose = require("mongoose");

// Define the schema for the AddressTimer model
const addressTimerSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
        unique: true,
    },
    date: {
        type: Date,
        required: true,
    },
    tokenUri: {
        type: String,
        default: "",
    },
});

// Create the AddressTimer model
const AddressTimer = mongoose.model("AddressTimer", addressTimerSchema);

module.exports = AddressTimer;
