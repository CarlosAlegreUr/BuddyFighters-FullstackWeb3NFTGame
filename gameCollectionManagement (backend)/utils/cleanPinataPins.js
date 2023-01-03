const pinataSDK = require("@pinata/sdk")
const PINATA_API_KEY = process.env.PINATA_API_KEY
const PINATA_API_SECRET = process.env.PINATA_API_SECRET

module.exports = async function () {
    const pinata = new pinataSDK(PINATA_API_KEY, PINATA_API_SECRET)
    const result = await pinata.pinList()
    console.log(result)
}


