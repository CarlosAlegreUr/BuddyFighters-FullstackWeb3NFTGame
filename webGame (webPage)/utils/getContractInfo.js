import { contractsInfo } from "../constants"

module.exports = {
    getContractAddress: function (chainId, contractName) {
        return contractsInfo[chainId].filter((contract) => {
            if (contract.contractName === contractName) return contracts.address
        })
    },

    getContractAbi: function (chainId, contractName) {
        return contractsInfo[chainId].filter((contract) => {
            if (contract.contractName === contractName) return contracts.abi
        })
    },
}
