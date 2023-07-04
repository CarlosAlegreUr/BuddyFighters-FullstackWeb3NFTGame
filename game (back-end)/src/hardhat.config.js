require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("@nomicfoundation/hardhat-chai-matchers");
require("./tasks/tasks");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy");

const RINKEBY_RPC_URL = process.env.GOERLI_RPC_URL;
const RINKEBY_SK_01 = process.env.RINKEBY_SK_01;
const ETHSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

module.exports = {
    solidity: "0.8.9",

    defaultNetwork: "hardhat",

    paths: {
        tests: "./tests/blockchainTests/unitTests/smartContractTests",
    },

    networks: {
        hardhat: {},

        localhost: {
            url: "http://127.0.0.1:8545",
            chainId: 31337,
        },

        goerli: {
            url: process.env.GOERLI_RPC_URL,
            accounts: [
                process.env.DEPLOYER_SK,
                process.env.CLIENT1_SK,
                process.env.CLIENT2_SK,
            ],
            chainId: 5,
            gas: 2100000,
            gasPrice: 8000000000,
        },
    },

    namedAccounts: {
        deployer: {
            default: 0,
            5: 0,
            31337: 0,
        },
        client1: {
            default: 1,
            5: 1,
            31337: 1,
        },
        client2: {
            default: 2,
            5: 2,
            31337: 2,
        },
    },

    etherscan: {
        apiKey: ETHSCAN_API_KEY,
    },

    gasReporter: {
        enabled: true,
        outputFile: "gasReport.txt",
        noColors: true,
        // Output it in a specific currency with API call to CoinMarketCap
        // currency: "USD",
        // coinmarketcap: CMC_API_KEY,
        // CHOSE COIN YOU WANNA SEE THE PRICE
        // token: "MATIC",
    },
};
