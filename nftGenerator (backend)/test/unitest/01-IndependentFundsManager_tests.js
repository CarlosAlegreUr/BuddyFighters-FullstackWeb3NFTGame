const { assert, expect } = require("chai")
const { ethers, getNamedAccounts } = require("hardhat")
const mintNFT = require("../../scripts/01-mint")

describe("IndependentFundsManager.sol tests", function () {
    let deployer,
        client1,
        client2,
        independentFundsManagerContract,
        buddyFightersNftContract

    beforeEach(async function () {
        const { deployer: dep } = await getNamedAccounts()
        deployer = dep
        independentFundsManagerContract = await ethers.getContract(
            "IndependentFundsManager",
            deployer
        )
    })

    describe("Fund and withdrawal tests", function () {
        it("Fund function works and withdrawal function too.", async () => {
            const initialEth = await ethers.provider.getBalance(deployer)
            const fund = await ethers.utils.parseEther("1")

            await independentFundsManagerContract.fund({
                value: fund,
            })
            const balance = await independentFundsManagerContract.getBalance(
                deployer
            )
            assert.equal(balance.toString(), fund.toString())
            assert.notEqual(
                initialEth,
                await ethers.provider.getBalance(deployer)
            )

            await independentFundsManagerContract.withdrawFunds(fund)
            const balanceInContract =
                await independentFundsManagerContract.getBalance(deployer)
            assert.equal(balanceInContract.toNumber(), 0)
        })
    })

    describe("Funds' state and funds' permissions management tests.", function () {
        beforeEach(async function () {
            const { client1: c1, client2: c2 } = await getNamedAccounts()
            client1 = c1
            client2 = c2
            independentFundsManagerC1 = await ethers.getContract(
                "IndependentFundsManager",
                client1
            )
            independentFundsManagerC2 = await ethers.getContract(
                "IndependentFundsManager",
                client2
            )
            buddyFightersNftContract = await ethers.getContract(
                "BuddyFightersNFT",
                deployer
            )
        })

        it("A client must have funds in order to frozen them or start giving permissions", async () => {
            await expect(
                independentFundsManagerC1.setFrozenFunds(true)
            ).revertedWithCustomError(
                independentFundsManagerContract,
                "IndependentFundsManager__BDFT__NoFundsFound"
            )
            await expect(
                independentFundsManagerC1.setPermission(0)
            ).revertedWithCustomError(
                independentFundsManagerContract,
                "IndependentFundsManager__BDFT__NoFundsFound"
            )
        })

        it("Frozen and enough funds modifiers test. If frozen devs can't use clients' funds.", async () => {
            await expect(
                independentFundsManagerContract.useFundsToMintNft(
                    "FakeURI",
                    client1
                )
            ).revertedWithCustomError(
                independentFundsManagerContract,
                "IndependentFundsManager__BDFT__NotEnoughFunds"
            )
            await expect(
                independentFundsManagerContract.useFundsToChangeStats(
                    "NewFakeURI",
                    client1,
                    0
                )
            ).revertedWithCustomError(
                independentFundsManagerContract,
                "IndependentFundsManager__BDFT__NotEnoughFunds"
            )
            await expect(
                independentFundsManagerContract.useFundsToStartFight(
                    [client1, client2],
                    [0, 1]
                )
            ).revertedWithCustomError(
                independentFundsManagerContract,
                "IndependentFundsManager__BDFT__NotEnoughFunds"
            )

            fund = ethers.utils.parseEther("1")
            await independentFundsManagerC1.fund({ value: fund })
            await independentFundsManagerC2.fund({ value: fund })
            const frozenFundsCombinatios = [
                [true, false],
                [false, true],
                [true, true],
            ]
            async function checks(combo) {
                await independentFundsManagerC1.setFrozenFunds(combo[0])
                await independentFundsManagerC1.setFrozenFunds(combo[1])
                await expect(
                    independentFundsManagerContract.useFundsToStartFight(
                        [client1, client2],
                        [0, 1]
                    )
                ).revertedWithCustomError(
                    independentFundsManagerContract,
                    "IndependentFundsManager__BDFT__ClientFundsAreFrozen"
                )
            }
            frozenFundsCombinatios.forEach((combo) => {
                checks(combo)
            })
            await expect(
                independentFundsManagerContract.useFundsToMintNft(
                    "FakeURI",
                    client1
                )
            ).revertedWithCustomError(
                independentFundsManagerContract,
                "IndependentFundsManager__BDFT__ClientFundsAreFrozen"
            )
            await expect(
                independentFundsManagerContract.useFundsToChangeStats(
                    "NewFakeURI",
                    client1,
                    0
                )
            ).revertedWithCustomError(
                independentFundsManagerContract,
                "IndependentFundsManager__BDFT__ClientFundsAreFrozen"
            )
        })

        it("When unfrozen funds, devs can't use them for functions without clients' permission.", async () => {
            const fund = ethers.utils.parseEther("1")
            await independentFundsManagerC1.fund({ value: fund })
            await independentFundsManagerC1.setFrozenFunds(false)
            await expect(
                independentFundsManagerContract.useFundsToMintNft(
                    "FakeURI",
                    client1
                )
            ).revertedWithCustomError(
                independentFundsManagerContract,
                "IndependentFundsManager__BDFT__ClientPermissionDenied"
            )
            await expect(
                independentFundsManagerContract.useFundsToChangeStats(
                    "NewFakeURI",
                    client1,
                    0
                )
            ).revertedWithCustomError(
                independentFundsManagerContract,
                "IndependentFundsManager__BDFT__ClientPermissionDenied"
            )
            await expect(
                independentFundsManagerContract.useFundsToStartFight(
                    [client1, client2],
                    [0, 1]
                )
            ).revertedWithCustomError(
                independentFundsManagerContract,
                "IndependentFundsManager__BDFT__ClientPermissionDenied"
            )
        })

        it("Clients can't call functions that spend funds.", async () => {
            await expect(
                independentFundsManagerC1.useFundsToMintNft("FakeURI", client1)
            ).revertedWith("Ownable: caller is not the owner")
            await expect(
                independentFundsManagerC1.useFundsToChangeStats(
                    "NewFakeURI",
                    client1,
                    0
                )
            ).revertedWith("Ownable: caller is not the owner")
            await expect(
                independentFundsManagerC1.useFundsToStartFight(
                    [client1, client2],
                    [0, 1]
                )
            ).revertedWith("Ownable: caller is not the owner")
        })

        it("Client's funds are frozen after executing a spending funds function.", async () => {
            const fund = ethers.utils.parseEther("1")
            await independentFundsManagerC1.fund({ value: fund })
            independentFundsManagerC1.setFrozenFunds(false)
            independentFundsManagerC1.setPermission(1)
            await expect(
                independentFundsManagerContract.useFundsToMintNft(
                    "FakeURI",
                    client1,
                    { value: ethers.utils.parseEther("0.1") }
                )
            ).not.to.be.reverted
            await expect(
                independentFundsManagerContract.useFundsToMintNft(
                    "FakeURI",
                    client1,
                    { value: ethers.utils.parseEther("0.1") }
                )
            ).revertedWithCustomError(
                independentFundsManagerContract,
                "IndependentFundsManager__BDFT__ClientFundsAreFrozen"
            )

            independentFundsManagerC1.setFrozenFunds(false)
            independentFundsManagerC1.setPermission(2)
            await expect(
                independentFundsManagerContract.useFundsToChangeStats(
                    "NewFakeURI",
                    client1,
                    0,
                    { value: ethers.utils.parseEther("0.1") }
                )
            ).not.to.be.reverted
            await expect(
                independentFundsManagerContract.useFundsToChangeStats(
                    "NewFakeURI",
                    client1,
                    0,
                    { value: ethers.utils.parseEther("0.1") }
                )
            ).revertedWithCustomError(
                independentFundsManagerContract,
                "IndependentFundsManager__BDFT__ClientFundsAreFrozen"
            )

            independentFundsManagerC1.setFrozenFunds(false)
            independentFundsManagerC1.setPermission(3)

            await independentFundsManagerC2.fund({ value: fund })
            independentFundsManagerC2.setFrozenFunds(false)
            independentFundsManagerC2.setPermission(3)
            await expect(
                independentFundsManagerContract.useFundsToStartFight(
                    [client1, client2],
                    [0, 1],
                )
            ).not.to.be.reverted
            await expect(
                independentFundsManagerContract.useFundsToStartFight(
                    [client1, client2],
                    [0, 1],
                )
            ).revertedWithCustomError(
                independentFundsManagerContract,
                "IndependentFundsManager__BDFT__ClientFundsAreFrozen"
            )
        })
    })
})
