const { ethers, network } = require("hardhat");
const fs = require("fs");

const FRONT_END_CONTRACTS_INFO_FILE_LOCATION =
    "../../website-game (front-end)/constants/contractsInfo.json";

const FRONT_END_CONTRACTS_TESTING_FILE =
    "test/blockchainTests/unitest/contractsInfoTesting.json";

module.exports = {
    updateFrontEndData: async function (
        contract,
        contractName,
        filePath = FRONT_END_CONTRACTS_INFO_FILE_LOCATION
    ) {
        if (process.env.UPDATE_FRONT_END) {
            const currentAddresses = JSON.parse(
                fs.readFileSync(filePath),
                "utf-8"
            );
            const chaindID = network.config.chainId.toString();
            const frontEndContractInfo = {
                contractName: contractName,
                address: contract.address,
                abi: contract.abi,
            };
            let needToWrite = true;
            if (chaindID in currentAddresses) {
                currentAddresses[chaindID].forEach((contract) => {
                    if (
                        contract.contractName ===
                        frontEndContractInfo.contractName
                    )
                        needToWrite = false;
                });
                currentAddresses[chaindID].push(frontEndContractInfo);
            } else {
                currentAddresses[chaindID] = [frontEndContractInfo];
            }
            if (needToWrite) {
                fs.writeFileSync(filePath, JSON.stringify(currentAddresses));
            }
        }
    },
    FRONT_END_CONTRACTS_TESTING_FILE: FRONT_END_CONTRACTS_TESTING_FILE,
};
