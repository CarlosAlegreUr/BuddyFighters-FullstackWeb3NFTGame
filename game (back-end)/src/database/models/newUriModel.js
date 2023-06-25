const mongoose = require("mongoose");

// Define the schema for the NewUri model
const newUriSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
        unique: true,
    },
    uri: {
        type: String,
        required: true,
        unique: true,
    },
});

// Create the NewUri model
const NewUri = mongoose.model("NewUri", newUriSchema);

module.exports = NewUri;
