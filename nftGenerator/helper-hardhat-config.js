const networkConfig = {
    4: {
        name: "rinkeby",
        // Add Chainlink aggregator price feed contract
    }   
}

const developmentNets = ["hardhat", "localhost"]

module.exports = {
    networkConfig,
    developmentNets,
}