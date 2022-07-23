const { assert, expect } = require("chai")
const { ethers } = require("hardhat")
const { deployBuddyFightersNFT } = require("../../deploy/01-deployBuddyFighterNFT")


const contractName = "BuddyFightersNFT"


describe("BuddyFigthersNFT.sol tests", function () {

    let buddyFightersNFTContract
    let svgImage
    let minimumPriceToMint
    
    beforeEach(async function () {
        buddyFightersNFTContract = await deployBuddyFightersNFT()
        await buddyFightersNFTContract.deployed()
        // svgImage = rndm bytes32 value 
        svgImage = "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc"
        minimumPriceToMint = ethers.utils.parseEther("0.01")
    })
    

    describe("Minting tests", function () {

        it("Mints NFT's with different ID's, each ID=previous ID+1", async () => {
            // NFT minted and stats saved on chain
            first_ID = 0 
            await buddyFightersNFTContract.mintNFT("Fake_URI", "Fake_Name", 
            svgImage, [100,101], true, {value: minimumPriceToMint})
            second_ID = await buddyFightersNFTContract.getLastNFTId()

            assert.notEqual(first_ID.toString(), second_ID.toString())
            assert.equal(first_ID.add(1).toString(), second_ID.toString())

            // NFT minted and stats saved on IPFS
            await buddyFightersNFTContract.mintNFT("Fake_URI", "Fake_Name", 
            svgImage, [100,101], false, {value: minimumPriceToMint})
            third_ID = await buddyFightersNFTContract.getLastNFTId()

            assert.notEqual(second_ID.toString(), third_ID.toString())
            assert.equal(second_ID.add(1).toString(), third_ID.toString())
        })


        it("When minting, NFT's attributes/traits are on the blockchain.", async function () {
            payed = ethers.utils.parseEther("0.01")
            await buddyFightersNFTContract.mintNFT("Fake_URI", "NameOfNftAt0", svgImage,
            [100,101], true, {value: payed})
            stats = await buddyFightersNFTContract.getAttributes("0")
            tokenURI = await buddyFightersNFTContract.tokenURI("0")
            assert.equal(stats.name, "NameOfNftAt0")
            assert.equal(stats.svgImage, svgImage)
            assert.equal(stats.pkmN1, 100)
            assert.equal(stats.pkmN2, 101)
            assert.equal(tokenURI, "Fake_URI")
        })


        it("When minting, if not desired, NFT's image is not on blockchain.", async function () {
            payed = ethers.utils.parseEther("0.01")
            await buddyFightersNFTContract.mintNFT("Fake_URI", "NameOfNftAt0", svgImage,
            [100,101], false, {value: payed})
            stats = await buddyFightersNFTContract.getAttributes("0")
            assert.equal(stats.svgImage, undefined)
        })


        it("If minimum amount not payed, NFT not minted.", async function () {
            await expect(buddyFightersNFTContract.mintNFT(
            "Fake_URI", 
            "Fake_Name", 
            svgImage,
            [100,101],
            true, 
            {value: (ethers.utils.parseEther("0.009"))})
            ).revertedWithCustomError(buddyFightersNFTContract, "MinimumPriceNotPayed")
        })


        it("If name too long or too short, NFT not minted.", async function () {
            await expect(buddyFightersNFTContract.mintNFT(
            "Fake_URI", 
            "Fake_Too_Long_Name_Cant_Have_More_Than_30_Characters_For_Storage_Cost_Reasons", 
            svgImage,
            [100,101],
            true, 
            {value: (ethers.utils.parseEther("0.01"))})
            ).revertedWithCustomError(buddyFightersNFTContract, "NameTooLong")

            await expect(buddyFightersNFTContract.mintNFT(
            "Fake_URI", 
            "", 
            svgImage,
            [100,101],
            true, 
            {value: (ethers.utils.parseEther("0.01"))})
            ).revertedWithCustomError(buddyFightersNFTContract, "NameTooShort")
        })


        it("Rarity calculated correctly.", async function () {
            allRarities = [1, 3, 5, 9, 15, 25]
            payed = ethers.utils.parseEther("0.01")
            await buddyFightersNFTContract.mintNFT("Fake_URI", "NameOfNftAt0", svgImage,
            [100,101], false, {value: payed})
            await buddyFightersNFTContract.mintNFT("Fake_URI", "NameOfNftAt1", svgImage,
            [45,150], false, {value: payed})
            await buddyFightersNFTContract.mintNFT("Fake_URI", "NameOfNftAt2", svgImage,
            [151,5], false, {value: payed})
            await buddyFightersNFTContract.mintNFT("Fake_URI", "NameOfNftAt3", svgImage,
            [150,150], false, {value: payed})
            await buddyFightersNFTContract.mintNFT("Fake_URI", "NameOfNftAt4", svgImage,
            [0,150], false, {value: payed})
            await buddyFightersNFTContract.mintNFT("Fake_URI", "NameOfNftAt5", svgImage,
            [0,151], false, {value: payed})
            for(i = 0; i < stats.length; i++){
                stats = await buddyFightersNFTContract.getAttributes(i.toString())
                expect(allRarities).to.include(stats.rarity)
            }
        })

    })


    describe("Random number generation tests", function () {

        it("Stats are generated in range [1, 255].", async function () {
            await buddyFightersNFTContract.mintNFT("Fake_URI", "Fake_Name", 
            svgImage, [100,101], true, {value: minimumPriceToMint})
            stats = await buddyFightersNFTContract.getAttributes("0")
            for(stat in stats.stats) {
                assert.notEqual(stat, "0")
            }
        })

    })


    describe("Improving stats tests", function () {

        let minPriceImproveStat

        beforeEach(async function () {
            minPriceImproveStat = ethers.utils.parseEther("0.01")
        })


        it("When improvig stats, correct quantity is added.", async  function () {
            await buddyFightersNFTContract.mintNFT("Fake_URI", "Fake_Name", 
            svgImage, [100,101], true, {value: minimumPriceToMint})

            prevStats = await buddyFightersNFTContract.getStats("0")

            // Adding median quantity
            quanitityAdded = 127
            for(i = 0; i < prevStats.length; i++) {
                await buddyFightersNFTContract.improveStat("0", i, quanitityAdded, {value: minPriceImproveStat})
            }
            
            newStats = await buddyFightersNFTContract.getStats("0")
            for(i = 0; i < prevStats.length; i++) {
                if(newStats[i] <= "254")
                    assert.equal((prevStats[i] + quanitityAdded), newStats[i])
                else 
                    assert.equal(prevStats[i], "254")
            }

            // Trying to exceed 255
            quanitityAdded = 254
            for(i = 0; i < prevStats.length; i++) {
                await buddyFightersNFTContract.improveStat("0", i, quanitityAdded, {value: minPriceImproveStat})
                await buddyFightersNFTContract.improveStat("0", i, quanitityAdded, {value: minPriceImproveStat})
            }
            
            newStats = await buddyFightersNFTContract.getStats("0")
            for(i = 0; i < prevStats.length; i++) 
                assert.equal(prevStats[i], "254")
        })


        it("If minimum price not payed, stats are not improved.", async  function () {
            await buddyFightersNFTContract.mintNFT("Fake_URI", "Fake_Name", 
            svgImage, [100,101], true, {value: minimumPriceToMint})

            quanitityAdded = 127
            for(i = 0; i < stats.length; i++) {
                expect(buddyFightersNFTContract.improveStat("0", i, quanitityAdded, {value: ethers.utils.parseEther("0.001")})
                ).revertedWithCustomError(buddyFightersNFTContract, "MinimumPriceNotPayed")
            }
        })

    })
}) 
