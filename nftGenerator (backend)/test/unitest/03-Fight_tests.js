const { assert, expect } = require("chai")
const { ethers } = require("hardhat")

describe("Fight.sol tests", function () {
    beforeEach(async function () {
        const independentFundsManagerContract = await ethers.getContract(
            "IndependentFundsManager",
            deployer
        )
    })

    describe("Fights deploy correctly tests. (solidity part)", function () {
        it("FundsManager correctly deploys a fight contract.", async function () {
            assert(1 === 0)
        })

        it("Funds are sent to fight contract.", async function () {
            assert(1 === 0)
        })
    })

    describe("Fights' mechanics tests.", function () {
        it("Winner recieves the price and only players can be delcared winners.", async function () {
            assert(1 === 0)
        })

        it("When finished, address set correctly and isActive = false.", async function () {
            assert(1 === 0)
        })

        it("Any player can cancel the fight if it's still active.", async function () {
            assert(1 === 0)
        })

        it("If fight is cancelled, funds are given back to players.", async function () {
            assert(1 === 0)
        })
    })
})

// const { ethers, network } = require("hardhat")
// const { networks } = require("../hardhat.config")
// const { networkConfig, developmentNets } = require("../helper-hardhat-config")
// require("dotenv").config()
//
// const { collectionName, collecitonSymbol } = require("../utils/appVariables")
// const { verify } = require("../utils/etherscanVerifyContract")
// const { updateFrontEndData } = require("../update-front-end")
//
// module.exports = async ({ getNamedAccounts, deployments }) => {
// console.log("Deploying fight...")
// const { deploy } = deployments
// const { deployer, client1, client2 } = getNamedAccounts()
// const independentFundsManagerContract = await ethers.getContract(
// "IndependentFundsManager",
// deployer
// )
//
// independentFundsManagerContract.useFundsToStartFight([client1, client2], [0,1])
// console.log("-----------------------------------")
// }
//
// module.exports.tags = ["all", "fight"]
