import { contractsInfo } from "../constants";

module.exports = {
  getContractAddress: function (chainId, contractName) {
    const contract = contractsInfo[chainId].find(
      (contract) => contract.contractName === contractName
    );

    if (contract) {
      return contract.address;
    } else {
      return null;
    }
  },

  getContractAbi: function (chainId, contractName) {
    const contract = contractsInfo[chainId].find(
      (contract) => contract.contractName === contractName
    );

    if (contract) {
      return contract.abi;
    } else {
      return null;
    }
  },
};
