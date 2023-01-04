const mintNFT = require("./01-mint")
const { ethers, getNamedAccounts, network } = require("hardhat")

async function callMint(name, onBlockchain, clientAddress) {
    const independentContract = await ethers.getContract(
        "IndependentFundsManager",
        clientAddress
    )
    console.log("FundsManager address --->", `${independentContract.address}`)

    // await independentContract.fund({ value: await ethers.utils.parseEther("0.01") })
    // console.log(`${clientAddress} funded.`)

    await independentContract.setFrozenFunds(false)
    console.log(`${clientAddress} unfrozened funds.`)

    const txResponse = await independentContract.setPermission(1)
    console.log(`${clientAddress} Permission given.`)
    console.log(`Waiting for confirmations...`)
    await txResponse.wait(6)

    await mintNFT(name, onBlockchain, clientAddress)
}

async function callMinting() {
    const { client1 } = await getNamedAccounts()
    callMint("Yuri mira tio esto funciona", false, client1)
}

callMinting()
