const { assert, expect } = require("chai")
const { ethers, getNamedAccounts, deployments } = require("hardhat")
const mintNFT = require("../../scripts/01-mint")

describe("BuddyFigthersNFT.sol tests", function () {
    let deployer,
        client1,
        client2,
        buddyFightersNFTContract,
        independentFundsManagerContract,
        independentFundsManagerClient
    const priceToMint = ethers.utils.parseEther("0.01")
    const priceToChangeStats = ethers.utils.parseEther("0.01")
    const priceToDeployFight = ethers.utils.parseEther("0.01")

    beforeEach(async function () {
        const {
            deployer: d,
            client1: c,
            client2: c2,
        } = await getNamedAccounts()
        deployer = d
        client1 = c
        client2 = c2
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

    describe("Accessibility tests", function () {
        it("Only IndependentFundsManager can mint, improveStats.", async () => {
            await expect(
                buddyFightersNFTContract.mintNft("Fake_URI", client1)
            ).revertedWithCustomError(
                buddyFightersNFTContract,
                "BuddyFightersNFT__IsNotFundsManager"
            )
        })
    })

    describe("Minting tests", function () {
        it("When minting, NFTs' metadata is stored correctly on the blockchain.", async function () {
            await independentFundsManagerClient.setPermission(1)
            let first_ID = await buddyFightersNFTContract.totalSupply()
            await independentFundsManagerContract.useFundsToMintNft(
                "Fake_URI",
                client1,
                { value: priceToMint }
            )
            assert.equal(
                await buddyFightersNFTContract.tokenURI(first_ID.toNumber()),
                "Fake_URI"
            )

            let second_ID = await buddyFightersNFTContract.totalSupply()
            await independentFundsManagerClient.setFrozenFunds(false)
            await independentFundsManagerClient.setPermission(1)
            await independentFundsManagerContract.useFundsToMintNft(
                "Fake_URI_2",
                client1,
                { value: priceToMint }
            )
            assert.equal(
                await buddyFightersNFTContract.tokenURI(second_ID.toNumber()),
                "Fake_URI_2"
            )
        })

        it("If minimum amount not payed, NFT not minted.", async function () {
            await independentFundsManagerClient.setFrozenFunds(false)
            await independentFundsManagerClient.setPermission(1)
            await expect(
                independentFundsManagerContract.useFundsToMintNft(
                    "Fake_URI",
                    client1,
                    { value: await ethers.utils.parseEther("0.0099999") }
                )
            ).revertedWithCustomError(
                independentFundsManagerContract,
                "IndependentFundsManager__BDFT__MinimumPriceNotPayed"
            )
        })
    })

    describe("Improving stats tests. (solidity code part)", function () {
        it("Metadata changes when stats improved.", async function () {
            await independentFundsManagerClient.setPermission(2)
            let txResponse =
                await independentFundsManagerContract.useFundsToChangeStats(
                    "NewFakeURIFAKEEEE",
                    client1,
                    0,
                    { value: ethers.utils.parseEther("0.011") }
                )
            const { logs: logs1 } = await txResponse.wait()
            let emited = false
            logs1.forEach((log) => {
                if (log.address == buddyFightersNFTContract.address) {
                    emited = true
                }
            })
            assert.isOk(emited)
            assert.equal(
                await buddyFightersNFTContract.tokenURI(0),
                "NewFakeURIFAKEEEE"
            )
        })

        it("If minimum price not payed, stats are not improved.", async function () {
            await independentFundsManagerClient.setPermission(2)
            await expect(
                independentFundsManagerContract.useFundsToChangeStats(
                    "NewFakeURI",
                    client1,
                    0,
                    { value: ethers.utils.parseEther("0.00999999") }
                )
            ).revertedWithCustomError(
                independentFundsManagerContract,
                "IndependentFundsManager__BDFT__MinimumPriceNotPayed"
            )
        })

        it("Only owner can change their NFT's stats.", async function () {
            await independentFundsManagerClient.setPermission(2)
            const independentFundsManagerClient2 = await ethers.getContract(
                "IndependentFundsManager",
                client2
            )
            await independentFundsManagerClient2.fund({
                value: await ethers.utils.parseEther("1"),
            })
            await independentFundsManagerClient2.setFrozenFunds(false)
            await independentFundsManagerClient2.setPermission(2)

            await expect(
                independentFundsManagerContract.useFundsToChangeStats(
                    "NewFakeURI",
                    client2,
                    0,
                    { value: ethers.utils.parseEther("0.011") }
                )
            ).revertedWithCustomError(
                independentFundsManagerContract,
                "IndependentFundsManager__BDFT__ChangeStatsFailed"
            )
        })
    })

    describe("Withdrawal tests", function () {
        it("Only deployer can withdraw tips and tips are withdrawn correctly.", async function () {
            await independentFundsManagerClient.setPermission(1)
            await independentFundsManagerContract.useFundsToMintNft(
                "Fake_URIAgain",
                client1,
                { value: await ethers.utils.parseEther("50") }
            )
            const accountBalanceBefore = await ethers.provider.getBalance(
                deployer
            )

            const txResponse =
                await buddyFightersNFTContract.withdrawContractBalance(deployer)
            const txReceipt = await txResponse.wait()
            const success = txReceipt.events[0].args[0]

            const contractBalance = await ethers.provider.getBalance(
                buddyFightersNFTContract.address
            )
            const accountBalanceAfter = await ethers.provider.getBalance(
                deployer
            )
            assert.equal(contractBalance, 0)
            assert.isAtLeast(accountBalanceAfter, accountBalanceBefore)
            assert.isOk(success)
        })
    })
})
