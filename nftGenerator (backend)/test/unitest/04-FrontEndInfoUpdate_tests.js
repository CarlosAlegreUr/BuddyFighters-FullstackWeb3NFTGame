const { assert, expect } = require("chai")
const { ethers, getNamedAccounts, deployments, network } = require("hardhat")
const { developmentNets } = require("../../helper-hardhat-config")

describe("update-front-end.js tests", function () {
    const { deploy } = deployments
    const { deployer } = getNamedAccounts()

    if (network.name === "hardhat") {
        beforeEach(async function () {
            // Deploy 2 contracts.
        })

        it("When checking for new contract, file updates correctly.", async function () {
            assert(1 === 0)
        })

        it("When checking for existing contract, file not updated.", async function () {
            assert(1 === 0)
        })
    }
})

