import { contractsAddresses, contractsAbis } from "../constants"

module.exports = {
    getContractAddress: function (chainId, contractName) {
        const chainAddresses = contractsAddresses[chainId]
        const size = contractsAddresses[chainId].length
        for (let i = 0; i < size; i++) {
            if(chainAddresses[i]["contractName"] === contractName)
                return chainAddresses[i]["address"]
        }
    },

    getContractAbi: function (chainId, contractName) {
        const chainAbis = contractsAbis[chainId]
        const size = contractsAbis[chainId].length
        for (let i = 0; i < size; i++) {
            if(chainAbis[i]["contractName"] === contractName)
                return chainAbis[i]["abi"]
        }
    },
}
