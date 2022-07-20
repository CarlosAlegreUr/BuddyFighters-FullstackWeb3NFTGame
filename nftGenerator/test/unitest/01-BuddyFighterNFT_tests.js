const { assert } = require("chai")
const { ethers } = require("hardhat")
// const {collectionName, collecitonSymbol} = require("../../utils/appVariables")

const { deployBuddyFightersNFT } = require("../../scripts/01-deployBuddyFighterNFT")

const contractName = "BuddyFightersNFT"


describe("BuddyFigthersNFT.sol tests", function () {

    // let buddyFightersNFTFactory 
    let buddyFightersNFTContract
    
    beforeEach(async () => {
        buddyFightersNFTContract = await deployBuddyFightersNFT()
    })
    

    /* Minting tests */

    it("Mints NFT's with different ID's, each ID=previous ID+1 (both blockchain and IPFS)", async () => {
        // NFT minted and traits saved on chain
        first_ID = await buddyFightersNFTContract.getLastNFTId() 
        await buddyFightersNFTContract.mintNFT("Fake_URI", "Fake_Name", true)
        second_ID = await buddyFightersNFTContract.getLastNFTId()

        assert.notEqual(first_ID.toString(), second_ID.toString())
        assert.equal(first_ID.add(1).toString(), second_ID.toString())

        // NFT minted and traits saved on IPFS
        await buddyFightersNFTContract.mintNFT("Fake_URI", "Fake_Name", false)
        third_ID = await buddyFightersNFTContract.getLastNFTId()

        assert.notEqual(second_ID.toString(), third_ID.toString())
        assert.equal(second_ID.add(1).toString(), third_ID.toString())
    })


    it("Saves NFT's stats in blockchain if desired.", function () {

    })


    it("If minimum amount not payed, NFT not minted.", function () {

    })


    it("If name too long, NFT not minted.", function () {

    })



    /* Improving stats tests */

    it("When improvig stats quantity is added.", function () {

    })


    it("When improvig stats exceeds 255, 255 is set as value.", function () {

    })



    /* Random number generation tests */

    it("Stats are in range [0, 255]", function () {

    })
}) 
