require("dotenv").config()

const GOERLI_CHAINLINK_SUBS_ID = process.env.GOERLI_CHAINLINK_SUBS_ID

const networkConfig = {
    31337: {
        name: "hardhat",
        callBackHashLimit: "500000",
        keyHashGasLimit: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        callBackHashLimit: "500000",
        linkBaseFeeMock: "0.01",
        gasPriceLinkMock: 1e9,
    },

    5: {
        name: "goerli",
        vrfCoordinator: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        vrfSubsId: GOERLI_CHAINLINK_SUBS_ID,
        keyHashGasLimit: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        callBackHashLimit: "2500000",
    }   
}

const developmentNets = ["hardhat", "localhost"]

module.exports = {
    networkConfig,
    developmentNets,
}
