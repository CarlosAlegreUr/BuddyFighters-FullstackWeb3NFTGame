const mongoose = require("mongoose");

// Define the schema for the AppStatus model
const appStatusSchema = new mongoose.Schema({
    onGoingFights: {
        type: Number,
        required: true,
    },
    accountsCreated: [{
        address: {
            type: String,
            required: true,
        },
        logInSecret: {
            type: String,
            required: true,
        },
    }],
});

// Create the AppStatus model
const AppStatus = mongoose.model("AppStatus", appStatusSchema);

module.exports = AppStatus;
