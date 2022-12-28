const { assert, expect } = require("chai")
const { ethers } = require("hardhat")

describe("Fight.sol tests", function () {
    let deployer,
        client1,
        client2,
        independentFundsManagerContract,
        independentFundsManagerContractC1,
        independentFundsManagerContractC2,
        fightAddress,
        fightContract

    beforeEach(async function () {
        const {
            deployer: d,
            client1: c,
            client2: c2,
        } = await getNamedAccounts()
        deployer = d
        client1 = c
        client2 = c2
        independentFundsManagerContract = await ethers.getContract(
            "IndependentFundsManager",
            deployer
        )
        independentFundsManagerContractC1 = await ethers.getContract(
            "IndependentFundsManager",
            client1
        )
        independentFundsManagerContractC2 = await ethers.getContract(
            "IndependentFundsManager",
            client2
        )
        await independentFundsManagerContractC1.fund({
            value: ethers.utils.parseEther("3.5"),
        })
        await independentFundsManagerContractC1.fund({
            value: ethers.utils.parseEther("3.5"),
        })
        await independentFundsManagerContractC1.setFrozenFunds(false)
        await independentFundsManagerContractC2.setFrozenFunds(false)
        await independentFundsManagerContractC1.setPermission(3)
        await independentFundsManagerContractC2.setPermission(3)
    })

    describe("Fights deploy correctly tests. (solidity part)", function () {
        it("FundsManager correctly deploys a fight contract.", async function () {
            const txResponse =
                await independentFundsManagerContract.useFundsToStartFight(
                    [client1, client2],
                    [0, 1],
                    { value: ethers.utils.parseEther("0.2") }
                )
            const { events } = await txResponse.wait()
            const address = events[0].args.battleAddress
            const fightContract = await ethers.getContractAt(
                "Fight",
                address,
                deployer
            )
            const fightId = await fightContract.getFightId()
            assert.isNotFalse(fightId)
        })

        it("Funds are sent to fight contract.", async function () {
            const txResponse =
                await independentFundsManagerContract.useFundsToStartFight(
                    [client1, client2],
                    [0, 1],
                    { value: ethers.utils.parseEther("0.2") }
                )
            const { events } = await txResponse.wait()
            const address = events[0].args.battleAddress
            const contractBalance = await ethers.provider.getBalance(address)
            const balanceInt = await ethers.utils.formatEther(contractBalance)
            assert.notEqual(contractBalance, 0)
            assert.equal(balanceInt, "0.2")
        })
    })

    describe("Fights' mechanics tests.", function () {
        beforeEach(async function () {
            const txResponse =
                await independentFundsManagerContract.useFundsToStartFight(
                    [client1, client2],
                    [0, 1],
                    { value: ethers.utils.parseEther("0.01") }
                )
            const { events } = await txResponse.wait()
            fightAddress = events[0].args.battleAddress
            fightContract = await ethers.getContractAt(
                "Fight",
                fightAddress,
                deployer
            )
        })

        it("Winner recieves the price, only players can be delcared winners, only admin can declare a winner.", async function () {
            const prevC1balance = await parseInt(
                await ethers.utils.formatEther(
                    await ethers.provider.getBalance(client1)
                )
            )
            expect(fightContract.winnerIs(deployer)).revertedWithCustomError(
                fightContract,
                "Fight__WinnersPrizeIsOnlyForPlayers"
            )
            fightContractC2 = await ethers.getContractAt(
                "Fight",
                fightAddress,
                client2
            )
            expect(fightContractC2.winnerIs(client1)).revertedWithCustomError(
                fightContract,
                "Fight__OnlyAdminIsAllowedToCallTheFunction"
            )

            await fightContract.winnerIs(client1)
            const afterC1balance = await parseInt(
                await ethers.utils.formatEther(
                    await ethers.provider.getBalance(client1)
                )
            )
            assert.equal(await ethers.provider.getBalance(fightAddress), 0)
            assert.isAtLeast(afterC1balance, prevC1balance)
        })

        it("Winner address and isActive change correctly.", async function () {
            assert.equal(
                await fightContract.getWinner(),
                "0x0000000000000000000000000000000000000000"
            )
            assert.isOk(await fightContract.getActive())
            await fightContract.winnerIs(client1)
            assert.isFalse(await fightContract.getActive())
            assert.equal(await fightContract.getWinner(), client1)
        })

        it("Only players can cancel fights.", async function () {
            expect(fightContract.cancelFight()).revertedWithCustomError(
                fightContract,
                "Fight__OnlyFightersAreAllowedToCallTheFunction"
            )
        })

        it("Player 1 can cancel the fight if it's still active and bids are returned.", async function () {
            const fightContractC1 = await ethers.getContractAt(
                "Fight",
                fightAddress,
                client1
            )
            const fightContractC2 = await ethers.getContractAt(
                "Fight",
                fightAddress,
                client2
            )
            let prevBalanceC1 = await ethers.utils.formatEther(
                await ethers.provider.getBalance(client1)
            )
            let prevBalanceC2 = await ethers.utils.formatEther(
                await ethers.provider.getBalance(client2)
            )
            await fightContractC1.cancelFight()
            const afterBalanceC1 = await ethers.utils.formatEther(
                await ethers.provider.getBalance(client1)
            )
            const afterBalanceC2 = await ethers.utils.formatEther(
                await ethers.provider.getBalance(client2)
            )
            assert.isAtMost(
                await parseFloat(prevBalanceC1),
                await parseFloat(afterBalanceC1)
            )
            assert.isAtMost(
                await parseFloat(prevBalanceC2),
                await parseFloat(afterBalanceC2)
            )
            expect(fightContractC1.cancelFight()).revertedWithCustomError(
                fightContract,
                "Fight__FightIsFinished"
            )
        })

        it("Player 2 can cancel the fight if it's still active and bids are returned.", async function () {
            const fightContractC1 = await ethers.getContractAt(
                "Fight",
                fightAddress,
                client1
            )
            const fightContractC2 = await ethers.getContractAt(
                "Fight",
                fightAddress,
                client2
            )
            let prevBalanceC1 = await ethers.utils.formatEther(
                await ethers.provider.getBalance(client1)
            )
            let prevBalanceC2 = await ethers.utils.formatEther(
                await ethers.provider.getBalance(client2)
            )
            await fightContractC2.cancelFight()
            const afterBalanceC1 = await ethers.utils.formatEther(
                await ethers.provider.getBalance(client1)
            )
            const afterBalanceC2 = await ethers.utils.formatEther(
                await ethers.provider.getBalance(client2)
            )
            assert.isAtMost(
                await parseFloat(prevBalanceC1),
                await parseFloat(afterBalanceC1)
            )
            assert.isAtMost(
                await parseFloat(prevBalanceC2),
                await parseFloat(afterBalanceC2)
            )
            expect(fightContractC2.cancelFight()).revertedWithCustomError(
                fightContract,
                "Fight__FightIsFinished"
            )
        })
    })
})
