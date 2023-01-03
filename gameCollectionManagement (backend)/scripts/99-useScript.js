const mintNFT = require("./01-mint")
const { ethers, getNamedAccounts, network } = require("hardhat")

async function callMint(name, onBlockchain, clientAddress) {
    const independentContract = await ethers.getContract(
        "IndependentFundsManager",
        clientAddress
    )
    await independentContract.fund({ value: ethers.utils.parseEther("0.01") })
    await independentContract.setFrozenFunds(false)
    await independentContract.setPermission(1)
    await mintNFT(name, onBlockchain, clientAddress)
}

async function callMint() {
    const { client1 } = await getNamedAccounts()
    callMint("NameRandomXD", false, client1)
}

callMint()
