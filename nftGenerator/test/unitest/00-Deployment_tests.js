const { assert } = require("chai")
const { ethers } = require("hardhat")
const { deployer } = require("../../deploy/deployer")


describe("Deployment tests", function () {

    let contract, contractName

    it("Mocks contracts are deployed correctly", async function () {
        contractName = ""
        contract = await deployer.deployMockContracts()
        const contractDeployed = await ethers.getContractAt(contractName, contract.address)
        assert.equal(contractDeployed.address, contract.address)
    })


    it("BuddyFightersNFT contract is deployed correctly", async function () {
        contractName = "BuddyFightersNFT"
        contract = await deployer.deployBuddyFightersNFT()
        const contractDeployed = await ethers.getContractAt(contractName, contract.address)
        assert.equal(contractDeployed.address, contract.address)
    })


    it("Fight contract is deployed correctly", async function () {
        contractName = "Fight"
        contract = await deployer.deployFightNFT()
        const contractDeployed = await ethers.getContractAt(contractName, contract.address)
        assert.equal(contractDeployed.address, contract.address)
    })
})