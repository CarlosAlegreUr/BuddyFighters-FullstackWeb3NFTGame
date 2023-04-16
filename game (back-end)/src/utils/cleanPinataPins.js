require("dotenv").config()
const pinataSDK = require("@pinata/sdk")

const PINATA_API_KEY = process.env.PINATA_API_KEY
const PINATA_API_SECRET = process.env.PINATA_API_SECRET

async function cleanAllPinnedPinata() {
    const pinata = new pinataSDK(PINATA_API_KEY, PINATA_API_SECRET)
    const { rows: files } = await pinata.pinList()
    console.log("Deleting pinata pinned files...")
    for (const file of files) {
        if (file.date_unpinned == null) await pinata.unpin(file.ipfs_pin_hash)
    }
    console.log("All deleted.")
}

module.exports = async function () {
    await cleanAllPinnedPinata()
}

async function use() {
    await cleanAllPinnedPinata()
}

use()
