require("dotenv").config()
require("@nomicfoundation/hardhat-toolbox")
require("@nomiclabs/hardhat-etherscan")
require("./tasks/tasks")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("hardhat-deploy")

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL
const RINKEBY_SK_01 = process.env.RINKEBY_SK_01
const ETHSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

module.exports = {
    solidity: "0.8.9",

    defaultNetwork: "hardhat",

    networks: {
        hardhat: {},

        localhost: {
            url: "http://127.0.0.1:8545",
            chainId: 31337,
        },

        rinkeby: {
            url: RINKEBY_RPC_URL,
            accounts: [RINKEBY_SK_01],
            chainId: 4,
        },
    },

    namedAccounts: {
        deployer: {
            default: 0,
            4: 0,
            31337: 0,
        },
        client1: {
            default: 1
        },
        client2: {
            default: 2
        }
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
}
