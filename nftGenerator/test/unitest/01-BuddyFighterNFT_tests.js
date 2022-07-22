const { assert } = require("chai")
const { ethers } = require("hardhat")
const { deployBuddyFightersNFT } = require("../../deploy/01-deployBuddyFighterNFT")


const contractName = "BuddyFightersNFT"


describe("BuddyFigthersNFT.sol tests", function () {

    let buddyFightersNFTContract
    
    beforeEach(async () => {
        buddyFightersNFTContract = await deployBuddyFightersNFT()
    })
    

    describe("Minting tests", function () {

        it("Mints NFT's with different ID's, each ID=previous ID+1 (both blockchain and IPFS)", async () => {
            // NFT minted and traits saved on chain
            first_ID = await buddyFightersNFTContract.getLastNFTId() 
            await buddyFightersNFTContract.mintNFT("Fake_URI", "Fake_Name", true, {value: (ethers.utils.parseEther("0.01"))})
            ethers.
            second_ID = await buddyFightersNFTContract.getLastNFTId()

            assert.notEqual(first_ID.toString(), second_ID.toString())
            assert.equal(first_ID.add(1).toString(), second_ID.toString())

            // NFT minted and traits saved on IPFS
            await buddyFightersNFTContract.mintNFT("Fake_URI", "Fake_Name", false, {value: (ethers.utils.parseEther("0.01"))})
            third_ID = await buddyFightersNFTContract.getLastNFTId()

            assert.notEqual(second_ID.toString(), third_ID.toString())
            assert.equal(second_ID.add(1).toString(), third_ID.toString())
        })


        it("When minting, if desired, saves NFT's stats in blockchain.", async function () {
            await buddyFightersNFTContract.mintNFT("Fake_URI", "Fake_Name", true, {value: (ethers.utils.parseEther("0.01"))})
            stats = await buddyFightersNFTContract.getStats("0")
            assert.notEqual("", stats.name)
        })


        it("If minimum amount not payed, NFT not minted.", function () {

        })


        it("If name too long, NFT not minted.", function () {

        })
    })



    describe("Improving stats tests", function () {

        it("When improvig stats quantity is added.", function () {
        
        })
    
    
        it("When improvig stats exceeds 255, 255 is set as value.", function () {
        
        })    
    })



    describe("Random number generation tests", function () {

        it("Stats are in range [0, 255]", function () {

        })
    })
}) 
