const axios = require("axios");

async function retrieveJsonFromIpfs(ipfsAddress) {
    try {
        const response = await axios.get(`https://ipfs.io/ipfs/${ipfsAddress}`);
        if (response.status === 200) {
            const json = response.data;
            return json;
        } else {
            throw new Error("Failed to retrieve JSON from IPFS");
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}

// Example usage
// const ipfsAddress = "QmfX9PgYvqQvauZfRrvTYgCT4BDCiy1xBFrbnMpXZsX5Rc";
// retrieveJsonFromIpfs(ipfsAddress)
//     .then((jsonData) => {
//         console.log(jsonData);
//     })
//     .catch((error) => {
//         console.error(error);
//     });

module.exports = {
    retrieveJsonFromIpfs,
};
