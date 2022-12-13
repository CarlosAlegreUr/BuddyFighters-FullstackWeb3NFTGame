const { assert } = require("chai")
const { ethers, getNamedAccounts, deployments } = require("hardhat")

describe("Deployment tests", function () {
    const { deploy } = deployments
    const { deployer } = getNamedAccounts()
    let contract, contractName, args

    it("Mocks' contracts are deployed correctly", async function () {
        contractName = "VRFCoordinatorV2Mock"    
        await deployments.fixture(["mocks"])
        contract = await deployments.get(contractName)
        const contractDeployed = await ethers.getContractAt(
            contractName,
            contract.address
        )
        assert.equal(contractDeployed.address, contract.address)
    })

    it("BuddyFightersNFT contract is deployed correctly", async function () {
        contractName = "BuddyFightersNFT"    
        await deployments.fixture(["buddyfighters"])
        contract = await deployments.get(contractName)
        const contractDeployed = await ethers.getContractAt(
            contractName,
            contract.address
        )
        assert.equal(contractDeployed.address, contract.address)
    })

    it("Fight contract is deployed correctly", async function () {
        // TODO
        assert.equal(1 === 0)
    })

    it("Contracts are verifyed on Etherscan correctly", async function() {
        //TODO
        // If local network function not called, if testnet then function called
        // and verified.
    })
})
