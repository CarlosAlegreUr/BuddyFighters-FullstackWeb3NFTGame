const { assert, expect } = require("chai")
const { ethers, getNamedAccounts } = require("hardhat")

// TODO: maybe add minimum balance required to run tests on testnet.
// And adapt tests so they can be runned in testnet.
describe("IndependentFundsManager.sol tests", function () {
    let deployer,
        client1,
        client2,
        independentFundsManagerContract,
        fund,
        vrfCoordinatorMockContract,
        mockEventFilter

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
                await independentFundsManagerC2.setFrozenFunds(combo[1])
                await independentFundsManagerC1.setPermission(3)
                await independentFundsManagerC2.setPermission(3)
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
            for (const combo of frozenFundsCombinatios) {
                await checks(combo)
            }
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
            await independentFundsManagerC1.setPermission(0)
            await independentFundsManagerC1.setFrozenFunds(false)
            await independentFundsManagerC2.setFrozenFunds(false)
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
            const pay = await ethers.utils.parseEther("0.1")
            await independentFundsManagerC1.fund({ value: fund })
            await independentFundsManagerC1.setFrozenFunds(false)
            await independentFundsManagerC1.setPermission(1)
            await independentFundsManagerContract.useFundsToMintNft(
                "FakeURI",
                client1,
                { value: pay }
            )
            await expect(
                independentFundsManagerContract.useFundsToMintNft(
                    "FakeURI",
                    client1,
                    { value: pay }
                )
            ).revertedWithCustomError(
                independentFundsManagerContract,
                "IndependentFundsManager__BDFT__ClientFundsAreFrozen"
            )

            await independentFundsManagerC1.setFrozenFunds(false)
            await independentFundsManagerC1.setPermission(2)
            await independentFundsManagerContract.useFundsToChangeStats(
                "NewFakeURI",
                client1,
                0,
                { value: pay }
            )
            await expect(
                independentFundsManagerContract.useFundsToChangeStats(
                    "NewFakeURI",
                    client1,
                    0,
                    { value: pay }
                )
            ).revertedWithCustomError(
                independentFundsManagerContract,
                "IndependentFundsManager__BDFT__ClientFundsAreFrozen"
            )

            await independentFundsManagerC1.setFrozenFunds(false)
            await independentFundsManagerC1.setPermission(3)

            await independentFundsManagerC2.fund({ value: fund })
            await independentFundsManagerC2.setFrozenFunds(false)
            await independentFundsManagerC2.setPermission(3)
            await independentFundsManagerContract.useFundsToStartFight(
                [client1, client2],
                [0, 1]
            )
            await expect(
                independentFundsManagerContract.useFundsToStartFight(
                    [client1, client2],
                    [0, 1]
                )
            ).revertedWithCustomError(
                independentFundsManagerContract,
                "IndependentFundsManager__BDFT__ClientFundsAreFrozen"
            )
        })
    })

    describe("Random number generation tests", function () {
        beforeEach(async function () {
            vrfCoordinatorMockContract = await ethers.getContract(
                "VRFCoordinatorV2Mock"
            )
            mockEventFilter = await vrfCoordinatorMockContract.filters
                .RandomWordsRequested
        })

        it("Pokemon numbers are generated in range [1, 151].", async function () {
            let num1, num2
            const filter = await independentFundsManagerContract.filters
                .IndependentFundsManager__BDFT__RndomNumsGenerated

            let txResponse =
                await independentFundsManagerContract.requestRandomNumbers(2)
            let txReceipt = await txResponse.wait()
            let txBlock = txReceipt.blockNumber
            let query = await vrfCoordinatorMockContract.queryFilter(mockEventFilter, txBlock)
            let requestId = query[0].args.requestId

            txResponse =
                await vrfCoordinatorMockContract.fulfillRandomWordsWithOverride(
                    requestId,
                    independentFundsManagerContract.address,
                    [0, 150]
                )
            txReceipt = await txResponse.wait()
            txBlock = txReceipt.blockNumber
            query = await independentFundsManagerContract.queryFilter(
                filter,
                txBlock
            )

            num1 = query[0].args.rndmNums[0]
            num2 = query[0].args.rndmNums[1]
            assert.isAtLeast(num1, 1)
            assert.isAtMost(num1, 151)
            assert.isAtLeast(num2, 1)
            assert.isAtMost(num2, 151)

            txResponse =
                await independentFundsManagerContract.requestRandomNumbers(2)
            txReceipt = await txResponse.wait()        
            txBlock = txReceipt.blockNumber
            query = await vrfCoordinatorMockContract.queryFilter(mockEventFilter, txBlock)
            requestId = query[0].args.requestId
            txResponse =
                await vrfCoordinatorMockContract.fulfillRandomWordsWithOverride(
                    requestId,
                    independentFundsManagerContract.address,
                    [
                        parseInt(Math.random() * 1000),
                        parseInt(Math.random() * 1000),
                    ]
                )
            txReceipt = await txResponse.wait()
            txBlock = txReceipt.blockNumber
            query = await independentFundsManagerContract.queryFilter(
                filter,
                txBlock
            )
            num1 = query[0].args.rndmNums[0]
            num2 = query[0].args.rndmNums[1]
            assert.isAtLeast(num1, 1)
            assert.isAtMost(num1, 151)
            assert.isAtLeast(num2, 1)
            assert.isAtMost(num2, 151)
        })

        it("Stats are generated in range [1, 255].", async function () {
            let nums = [-1, -1, -1, -1, -1, -1]
            const filter = await independentFundsManagerContract.filters
                .IndependentFundsManager__BDFT__RndomStatsGenerated

            let txResponse =
                await independentFundsManagerContract.requestRandomNumbers(6)
            let txReceipt = await txResponse.wait()
            let txBlock = txReceipt.blockNumber
            let query = await vrfCoordinatorMockContract.queryFilter(mockEventFilter, txBlock)
            let requestId = query[0].args.requestId
            txResponse =
                await vrfCoordinatorMockContract.fulfillRandomWordsWithOverride(
                    requestId,
                    independentFundsManagerContract.address,
                    [
                        0,
                        254,
                        parseInt(Math.random() * 1000),
                        parseInt(Math.random() * 1000),
                        parseInt(Math.random() * 1000),
                        parseInt(Math.random() * 1000),
                    ]
                )
            await txResponse.wait()
            txBlock = txResponse.blockNumber
            query = await independentFundsManagerContract.queryFilter(
                filter,
                txBlock
            )
            nums.forEach((num, index) => {
                num = query[0].args.rndmNums[index]
                assert.isAtLeast(num, 1)
                assert.isAtMost(num, 255)
            })
        })
    })
})
