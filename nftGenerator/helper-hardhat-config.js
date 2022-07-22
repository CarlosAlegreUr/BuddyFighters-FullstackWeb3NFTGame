// require("dotenv").config()

const RINKEBY_CHAINLINK_SUBS_ID = process.env.RINKEBY_CHAINLINK_SUBS_ID

const networkConfig = {
    31337: {
        name: "hardhat",
        callBackHashLimit: "500000",
    },

    4: {
        name: "rinkeby",
        vrfCoordinator: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        vrfSubsId: RINKEBY_CHAINLINK_SUBS_ID,
        keyHashGasLimit: "xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        callBackHashLimit: "500000",
    }   
}

const developmentNets = ["hardhat", "localhost"]

module.exports = {
    networkConfig,
    developmentNets,
}
