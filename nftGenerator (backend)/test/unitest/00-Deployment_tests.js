const { assert, expect } = require("chai")
const { ethers, getNamedAccounts, deployments, network } = require("hardhat")
const { developmentNets } = require("../../helper-hardhat-config")

describe("Deployment tests", function () {
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

    it("IndependentFundsManager contract is deployed correctly + collection address once set is locked.", async function () {
        contractName = "IndependentFundsManager"
        await deployments.fixture(["fundsManager"])
        contract = await deployments.get(contractName)
        const contractDeployed = await ethers.getContractAt(
            contractName,
            contract.address
        )
        assert.equal(contractDeployed.address, contract.address)
        const { deployer } = await getNamedAccounts()
        const c = await ethers.getContract(contractName, deployer)
        await c.setCollectionAddress("0x000000000000000000000000000000000000dEaD")
        await expect(
            c.setCollectionAddress("0x000000000000000000000000000000000000dEaD")
        ).revertedWithCustomError(
            c,
            "IndependentFundsManager__BDFT__LockerLockedForever"
        )
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

    if (!developmentNets.includes(network.name)) {
        it("Contracts are verifyed on Etherscan correctly", async function () {
            //TODO
            // If local network function not called, if testnet then function called
            // and verified.
            assert(1 == 0)
        })
    }
})
