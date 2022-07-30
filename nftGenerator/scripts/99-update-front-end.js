const { ethers, network } = require("hardhat")
const fs = require("fs")

const FRONT_END_ADDRESSES_FILE_LOCATION =
    "../../webGame/constants/contractAddresses"
const FRONT_END_ABIS_FILE_LOCATION = "../../webGame/constants/abis.json"

// module.exports = async function (contract, contractName) {
//     if (process.env.UPDATE_FRONT_END) {
//         console.log("Updating front-end...")
//         updateContractAddresses(contract, contractName)
//         updateContractAbis(contract, contractName)
//     }
// }

module.exports = {
    updateFrontEndData: async function (contract, contractName) {
        if (process.env.UPDATE_FRONT_END) {
            console.log("Updating front-end...")
            updateContractAddresses(contract, contractName)
            updateContractAbis(contract, contractName)
        }
    },
}

async function updateContractAbis(contract, contractName) {
    // const currentAbis = JSON.parse(
        // fs.readFileSync(FRONT_END_ABIS_FILE_LOCATION),
        // "utf-8"
    // )

    const currentAbis = require(FRONT_END_ABIS_FILE_LOCATION)
    const chaindID = network.config.chainId.toString()
    const frontEndcontractInfo = {
        contractName: contractName,
        abi: contract.interface,
    }
    if (chaindID in currentAbis) {
        if (!currentAbis[chaindID].includes(contract.interface)) {
            await currentAbis[chaindID].push(frontEndcontractInfo)
        }
    } else {
        currentAbis[chaindID] = [frontEndcontractInfo]
    }
    await fs.writeFileSync(
        FRONT_END_ABIS_FILE_LOCATION,
        JSON.stringify(currentAbis)
    )
}

async function updateContractAddresses(contract, contractName) {
    // const currentAddresses = JSON.parse(
        // fs.readFileSync("FRONT_END_ADDRESSES_FILE_LOCATION"),
        // "utf-8"
    // )
    const currentAddresses = require(FRONT_END_ADDRESSES_FILE_LOCATION)
    const chaindID = network.config.chainId.toString()
    const frontEndcontractInfo = {
        contractName: contractName,
        address: contract.address,
    }
    if (chaindID in currentAddresses) {
        if (!currentAddresses[chaindID].includes(contract.address)) {
            currentAddresses[chaindID].push(frontEndcontractInfo)
        }
    } else {
        currentAddresses[chaindID] = [frontEndcontractInfo]
    }
    fs.writeFileSync(
        FRONT_END_ADDRESSES_FILE_LOCATION,
        JSON.stringify(currentAddresses)
    )
    console.log("Written")
}

// module.exports.tags = ["all", "frontend"]
