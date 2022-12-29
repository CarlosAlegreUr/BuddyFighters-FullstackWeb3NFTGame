require("dotenv").config()

const RINKEBY_CHAINLINK_SUBS_ID = process.env.RINKEBY_CHAINLINK_SUBS_ID

const networkConfig = {
    31337: {
        name: "hardhat",
        callBackHashLimit: "500000",
        keyHashGasLimit: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        callBackHashLimit: "500000",
        linkBaseFeeMock: "0.01",
        gasPriceLinkMock: 1e9,
    },

    4: {
        name: "rinkeby",
        vrfCoordinator: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        vrfSubsId: RINKEBY_CHAINLINK_SUBS_ID,
        keyHashGasLimit: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        callBackHashLimit: "500000",
    }   
}

const developmentNets = ["hardhat", "localhost"]

module.exports = {
    networkConfig,
    developmentNets,
}
