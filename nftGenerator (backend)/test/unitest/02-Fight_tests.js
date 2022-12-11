const { assert, expect } = require("chai")
const { ethers } = require("hardhat")
const { deployFight } = require("../../deploy/02-deployFight")

describe("Fight.sol tests", function () {

    let FightContract

    beforeEach(async function() { 
        accounts = await ethers.getSigners() 
        nftIds = [0, 1, 2, 3, 4]
        FightContract = deployFight(accounts[0].address, accounts[1].address, 0, 1)
    })

    it("When fight canceled, contract s_active == false", async function() {

    })

})
