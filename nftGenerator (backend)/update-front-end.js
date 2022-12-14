const { ethers, network } = require("hardhat")
const fs = require("fs")

const FRONT_END_CONTRACTS_INFO_FILE_LOCATION =
    "../webGame (webPage)/constants/contractsInfo.json"

// Be careful with running this in localhost or command line hardhat network one after the other.
module.exports = {
    updateFrontEndData: async function (contract, contractName) {
        if (process.env.UPDATE_FRONT_END) {
            const currentAddresses = JSON.parse(
                fs.readFileSync(FRONT_END_CONTRACTS_INFO_FILE_LOCATION),
                "utf-8"
            )
            const chaindID = network.config.chainId.toString()
            const frontEndContractInfo = {
                contractName: contractName,
                address: contract.address,
                abi: contract.abi,
            }
            let needToWrite = true
            if (chaindID in currentAddresses) {
                currentAddresses[chaindID].forEach((contract) => {
                    if (contract.address === frontEndContractInfo.address)
                        needToWrite = false
                })
                currentAddresses[chaindID].push(frontEndContractInfo)
            } else {
                currentAddresses[chaindID] = [frontEndContractInfo]
            }
            if (needToWrite) {
                fs.writeFileSync(
                    FRONT_END_CONTRACTS_INFO_FILE_LOCATION,
                    JSON.stringify(currentAddresses)
                )
            }
        }
    },
}
