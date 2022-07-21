const { assert } = require("chai")
const { ethers } = require("hardhat")
const { deployBuddyFightersNFT } = require("../../deploy/01-deployBuddyFighterNFT")


describe("Deployment tests.", function () {

    let contract, contractName

    it("Test if Mocks contracts are deployed correctly.", async function () {
        contractName = ""
        // contract = await deployBuddyFightersNFT()
        // const contractDeployed = await ethers.getContractAt(contractName, contract.address)
        // assert.equal(contractDeployed.address, contract.address)
    })


    it("Test if BuddyFightersNFT contract is deployed correctly.", async function () {
        contractName = "BuddyFightersNFT"
        contract = await deployBuddyFightersNFT()
        const contractDeployed = await ethers.getContractAt(contractName, contract.address)
        assert.equal(contractDeployed.address, contract.address)
    })


    it("Test if Fight contract is deployed correctly.", async function () {
        contractName = ""
        // contract = await deployBuddyFightersNFT()
        // const contractDeployed = await ethers.getContractAt(contractName, contract.address)
        // assert.equal(contractDeployed.address, contract.address)
    })
})