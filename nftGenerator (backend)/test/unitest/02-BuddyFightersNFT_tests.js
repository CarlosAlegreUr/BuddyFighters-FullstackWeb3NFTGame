const { assert, expect } = require("chai")
const { ethers, getNamedAccounts, deployments } = require("hardhat")
const mintNFT = require("../../scripts/01-mint")

describe("BuddyFigthersNFT.sol tests", function () {
    let deployer,
        client1,
        buddyFightersNFTContract,
        independentFundsManagerContract,
        independentFundsManagerClient
    const priceToMint = ethers.utils.parseEther("0.01")
    const priceToChangeStats = ethers.utils.parseEther("0.01")
    const priceToDeployFight = ethers.utils.parseEther("0.01")

    beforeEach(async function () {
        const { deployer: d, client1: c } = getNamedAccounts()
        deployer = d
        client1 = c
        buddyFightersNFTContract = await ethers.getContract(
            "BuddyFightersNFT",
            deployer
        )
        independentFundsManagerContract = await ethers.getContract(
            "IndependentFundsManager",
            deployer
        )
        independentFundsManagerClient = await ethers.getContract(
            "IndependentFundsManager",
            client1
        )
        await independentFundsManagerClient.fund({
            value: ethers.utils.parseEther("2"),
        })
        await independentFundsManagerClient.setFrozenFunds(false)
    })

    describe("Minting tests", function () {
        it("Mints NFT's with different ID's, each ID=previous ID+1.", async () => {
            await independentFundsManagerClient.setPermission(1)
            let first_ID = await buddyFightersNFTContract.totalSupply()
            await independentFundsManagerContract.useFundsToMintNft(
                buddyFightersNFTContract.address,
                "Fake_URI",
                client1,
                { value: priceToMint }
            )
            let second_ID = await buddyFightersNFTContract.totalSupply()

            await independentFundsManagerClient.setFrozenFunds(false)
            await independentFundsManagerClient.setPermission(1)
            await independentFundsManagerContract.useFundsToMintNft(
                buddyFightersNFTContract.address,
                "Fake_URI_2",
                client1,
                { value: priceToMint }
            )
            assert.notEqual(first_ID.toString(), second_ID.toString())
            assert.equal(first_ID.add(1).toString(), second_ID.toString())

            // NFT minted and stats saved on IPFS
            await buddyFightersNFTContract.mintNFT(
                "Fake_URI",
                "Fake_Name",
                svgImage,
                [100, 101],
                false,
                { value: minimumPriceToMint }
            )
            let third_ID = await buddyFightersNFTContract.getLastNFTId()

            assert.notEqual(second_ID.toString(), third_ID.toString())
            assert.equal(second_ID.add(1).toString(), third_ID.toString())
        })

        it("When minting, NFTs' metadata is stored correctly on the blockchain.", async function () {
            payed = ethers.utils.parseEther("0.01")
            const txResponse = await buddyFightersNFTContract.mintNFT(
                "Fake_URI",
                "NameOfNftAt0",
                svgImage,
                [100, 101],
                true,
                { value: payed }
            )
            const txReceipt = await txResponse.wait(1)
            const nftId = txReceipt.events[2].args.tokenId
            stats = await buddyFightersNFTContract.getAttributes(
                nftId.toString()
            )
            tokenURI = await buddyFightersNFTContract.tokenURI(nftId.toString())
            assert.equal(stats.name, "NameOfNftAt0")
            assert.equal(stats.svgImage, svgImage)
            assert.equal(stats.pkmN1, 100)
            assert.equal(stats.pkmN2, 101)
            assert.equal(tokenURI, "Fake_URI")
        })

        it("If minimum amount not payed, NFT not minted.", async function () {
            await expect(
                buddyFightersNFTContract.mintNFT(
                    "Fake_URI",
                    "Fake_Name",
                    svgImage,
                    [100, 101],
                    true,
                    { value: ethers.utils.parseEther("0.009") }
                )
            ).revertedWithCustomError(
                buddyFightersNFTContract,
                "BuddyFightersNFT__MinimumPriceNotPayed"
            )
        })
    })

    describe("Random number generation tests", function () {
        it("Stats are generated in range [1, 255].", async function () {
            const txReceipt = await mintNFT(
                "Fake_URI",
                "Fake_Name",
                svgImage,
                true,
                minimumPriceToMint
            )
            const nftId = await txReceipt.events[2].args.tokenId
            stats = await buddyFightersNFTContract.getAttributes(
                nftId.toString()
            )
            stats.stats.forEach((stat) => {
                assert.notEqual(stat, "0")
            })
        })
    })

    describe("Improving stats tests. (solidity code part)", function () {
        it("If minimum price not payed, stats are not improved.", async function () {
            await buddyFightersNFTContract.mintNFT(
                "Fake_URI",
                "Fake_Name",
                svgImage,
                [100, 101],
                true,
                { value: minimumPriceToMint }
            )

            quanitityAdded = 127
            for (i = 0; i < 6; i++) {
                expect(
                    buddyFightersNFTContract.improveStat(
                        "0",
                        i,
                        quanitityAdded,
                        { value: ethers.utils.parseEther("0.01") }
                    )
                ).to.be.revertedWithCustomError(
                    buddyFightersNFTContract,
                    "BuddyFightersNFT__MinimumPriceNotPayed"
                )
            }
        })

        it("Only owner can change their NFT's stats.", async function () {})

        it("Only funds manager can call this function.", async function () {})
    })

    describe("Withdrawal tests", function () {
        it("Only deployer can withdraw and funds are withdrawn correctly.", async function () {})
    })
})
