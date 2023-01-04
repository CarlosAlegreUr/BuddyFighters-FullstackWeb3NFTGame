const mintNFT = require("./01-mint")
const withdrawal = require("./05-withdrawal")
const { ethers, getNamedAccounts, network } = require("hardhat")

async function callMint(name, onBlockchain, clientAddress) {
    const independentContract = await ethers.getContract(
        "IndependentFundsManager",
        clientAddress
    )
    console.log("FundsManager address --->", `${independentContract.address}`)

    await independentContract.fund({
        value: await ethers.utils.parseEther("0.01"),
    })
    console.log(`${clientAddress} funded.`)

    await independentContract.setFrozenFunds(false)
    console.log(`${clientAddress} unfrozened funds.`)

    const txResponse = await independentContract.setPermission(1)
    console.log(`${clientAddress} Permission given.`)
    console.log(`Waiting for confirmations...`)
    await txResponse.wait(6)

    await mintNFT(name, onBlockchain, clientAddress)
}

async function callMinting() {
    const { client2 } = await getNamedAccounts()
    callMint("Pero Castillo Lapiedra", false, client2)
}

callMinting()

async function callWithdrawal() {
    const { client2 } = await getNamedAccounts()
    await withdrawal(client2)
}

// callWithdrawal()
