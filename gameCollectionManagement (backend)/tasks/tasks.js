const { task } = require("hardhat/config")

// const { ethers, getNamedAccounts, network } = require("hardhat")
const { developmentNets } = require("../helper-hardhat-config")

// const mintNFT = require("../scripts/01-mint")

task("mint", "Mints NFT to an account.")
    .addParam("name", "nft name")
    .addParam("clientaddress", "address to mint nft for")
    .setAction(async ({ name, clientaddress }, hre) => {
        console.log("XD LLAMADA --->  ", `${name} --- ${clientaddress}`)
        // if (developmentNets.includes(hre.network.name)) {
        //     await simulateFrontEndClientAction(
        //         clientAddress,
        //         "0.01",
        //         false,
        //         1,
        //         hre
        //     )
        // }

        // await mintNFT(name, false, clientAddress)
    })

async function simulateFrontEndClientAction(
    clientAddress,
    fundsFunded = "0.01",
    frozen = false,
    permission,
    hre
) {
    const independentFundsManagerContract = await hre.ethers.getContract(
        "IndependentFundsManager",
        clientAddress
    )
    await independentFundsManagerContract.fund({
        value: ethers.utils.parseEther(fundsFunded),
    })
    await independentFundsManagerContract.setFrozenFunds(frozen)
    await independentFundsManagerContract.setPermission(permission)
}
