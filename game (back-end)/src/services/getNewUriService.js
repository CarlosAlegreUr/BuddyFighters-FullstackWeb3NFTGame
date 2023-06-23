const NewUri = require("../database/models/newUris");

async function getNewUri(clientAddress) {
    try {
        const newUri = await NewUri.findOne({ clientAddress });
        return newUri ? newUri.uri : false;
    } catch (err) {
        throw err;
    }
}

module.exports = { getNewUri };
