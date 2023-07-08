const { assert, expect } = require("chai");
const { ethers, getNamedAccounts, deployments, network } = require("hardhat");

const { prices } = require("../../../../businessConstants.json");

describe("BFNFTFightsManager.sol tests", function () {
    const inLocalhost = network.name == "localhost" ? true : false;
    let provider,
        deployer,
        client1,
        client2,
        BFNFTFightsManagerContract,
        BFNFTFightsManagerClient1,
        fightStartedEventFilter,
        fightResultEventFilter,
        withdrawalFilter,
        betReturnedFilter,
        priceForFightTicket,
        betInEthers,
        startFightValues,
        fightId;

    // Helper functions
    async function allowStartFight(player, inputs) {
        const types = [
            { type: "address[2]" },
            { type: "uint256[2]" },
            { type: "uint256[2]" },
        ];
        const coder = new ethers.AbiCoder();
        const abiEncodedInput = await coder.encode(types, inputs);
        const validInput = await ethers.keccak256(abiEncodedInput);
        const txResponse = await BFNFTFightsManagerContract.allowInputs(
            player,
            [validInput],
            "startFight(address[2],uint256[2],uint256[2])",
            false
        );
        await txResponse.wait();
    }

    async function getFightId(players, tokenIds) {
        const types = [
            { type: "address" },
            { type: "address" },
            { type: "uint256" },
            { type: "uint256" },
        ];
        const inputs = [players[0], players[1], tokenIds[0], tokenIds[1]];
        const coder = new ethers.AbiCoder();
        const abiEncodedInput = await coder.encode(types, inputs);
        const fightId = await ethers.keccak256(abiEncodedInput);
        return fightId;
    }

    async function buyXTickets(buyer, quantity) {
        const contract = await ethers.getContract("BFNFTFightsManager", buyer);
        for (i = 0; i < quantity; i++) {
            await contract.buyTicket({ value: priceForFightTicket });
        }
    }

    async function getTicketsOfAsInt(address) {
        const tickets = await ethers.toNumber(
            await BFNFTFightsManagerContract.getTicketsOf(address)
        );
        return tickets;
    }

    async function getRecievedMoneyInWithdrawn(txReceipt) {
        const txBlock = txReceipt.blockNumber;
        const query = await BFNFTFightsManagerContract.queryFilter(
            withdrawalFilter,
            txBlock
        );
        const recieved = query[0].args[0];
        return recieved;
    }

    function delay(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    // Tests
    beforeEach(async function () {
        if (inLocalhost) {
            provider = new ethers.JsonRpcProvider("http://localhost:8545");
        }
        const {
            deployer: d,
            client1: c,
            client2: c2,
        } = await getNamedAccounts();
        deployer = d;
        client1 = c;
        client2 = c2;
        // Contracts with different signers
        inputControlModularJustContract = await ethers.getContract(
            "InputControlModularFight"
        );
        BFNFTFightsManagerContract = await ethers.getContract(
            "BFNFTFightsManager",
            deployer
        );
        BFNFTFightsManagerClient1 = await ethers.getContract(
            "BFNFTFightsManager",
            client1
        );
        BFNFTFightsManagerClient2 = await ethers.getContract(
            "BFNFTFightsManager",
            client2
        );
        // Event filters
        fightStartedEventFilter = await BFNFTFightsManagerContract.filters
            .BFNFT__FManager__FightStarted;
        fightResultEventFilter = await BFNFTFightsManagerContract.filters
            .BFNFT__FManager__FightResult;
        withdrawalFilter = await BFNFTFightsManagerContract.filters
            .BFNFT__FManager__FundsWithdrawn;
        betReturnedFilter = await BFNFTFightsManagerContract.filters
            .BFNFT__FManager__BetReturned;

        // Prices
        priceForFightTicket = await ethers.parseEther(
            await prices.fightTicket.toString()
        );
        betInEthers = await ethers.parseEther("0.1");
        fightId = await getFightId([client1, client2], [1, 0]);
        startFightValues = [
            [client1, client2],
            [1, 0],
            [betInEthers, betInEthers],
        ];
    });

    it("buyTicket(): Only buys 1 ticket per call.", async () => {
        // With client 1
        let ticketsOfC1 = await getTicketsOfAsInt(client1);
        assert.equal(0, ticketsOfC1);
        await buyXTickets(client1, 1);
        ticketsOfC1 = await getTicketsOfAsInt(client1);
        assert.equal(1, ticketsOfC1);
        // With client 2
        let ticketsOfC2 = await getTicketsOfAsInt(client2);
        assert.equal(0, ticketsOfC2);
        await buyXTickets(client2, 1);
        ticketsOfC2 = await getTicketsOfAsInt(client2);
        assert.equal(1, ticketsOfC2);
    });

    it("setBet(): Is called correctly.", async () => {
        await BFNFTFightsManagerClient1.setBet({
            value: betInEthers,
        });
        await BFNFTFightsManagerClient2.setBet({
            value: betInEthers,
        });
    });

    it("startFight(): Owner can't start fights.", async () => {
        await expect(
            BFNFTFightsManagerContract.startFight(
                [client1, client2],
                [0, 1],
                [betInEthers, betInEthers]
            )
        ).to.be.revertedWithCustomError(
            BFNFTFightsManagerContract,
            "BFNFT__FManager__OwnerMusntCallStartFightToPreventAbuse"
        );
    });

    it("startFight(): If called as expected, fights start correctly and event emitted.", async () => {
        // Tickets and players' bets have been set before in the tests above.
        await expect(
            BFNFTFightsManagerClient1.startFight(
                [client1, client2],
                [0, 1],
                [betInEthers, betInEthers]
            )
        ).to.be.revertedWithCustomError(
            inputControlModularJustContract,
            "InputControlModular__NotAllowedInput"
        );

        // To later check if tickets correctly decrease.
        await buyXTickets(client2, 2);
        const ticketsC1prev = await getTicketsOfAsInt(client1);
        const ticketsC2prev = await getTicketsOfAsInt(client2);

        // Giving permission to players
        await allowStartFight(client1, startFightValues);
        await allowStartFight(client2, startFightValues);

        // Permision given to both players, checking for
        // correct fightId update and emitted event startFightValues.
        // Notice getFightId() is tested here too
        let fightState = await BFNFTFightsManagerContract.getIsFightActive(
            fightId
        );
        assert.equal(fightState, false);

        // Getting event from logs
        const txResponse = await BFNFTFightsManagerClient1.startFight(
            [client1, client2],
            [1, 0],
            [betInEthers, betInEthers]
        );
        const txReceipt = await txResponse.wait();
        const txBlock = txReceipt.blockNumber;
        const query = await BFNFTFightsManagerContract.queryFilter(
            fightStartedEventFilter,
            txBlock
        );
        const fightIdSet = query[0].args[0];
        assert.deepEqual(fightId, fightIdSet);
        fightState = await BFNFTFightsManagerContract.getIsFightActive(fightId);
        assert.equal(fightState, true);

        // Only 1 ticket should have been used.
        let ticketsC1later = await getTicketsOfAsInt(client1);
        let ticketsC2later = await getTicketsOfAsInt(client2);
        assert.equal(ticketsC1prev, ticketsC1later + 1);
        assert.equal(ticketsC2prev, ticketsC2later + 1);

        await expect(
            BFNFTFightsManagerClient2.startFight(
                [client1, client2],
                [1, 0],
                [betInEthers, betInEthers]
            )
        ).to.be.revertedWithCustomError(
            BFNFTFightsManagerContract,
            "BFNFT__FManager__Only1FightAtATime"
        );

        // Only 1 ticket should still have been used.
        ticketsC1later = await getTicketsOfAsInt(client1);
        ticketsC2later = await getTicketsOfAsInt(client2);
        assert.equal(ticketsC1prev, ticketsC1later + 1);
        assert.equal(ticketsC2prev, ticketsC2later + 1);
    });

    it("setBet(): Player can't bet during battle.", async () => {
        await expect(
            BFNFTFightsManagerClient1.setBet({
                value: betInEthers,
            })
        ).to.be.revertedWithCustomError(
            BFNFTFightsManagerContract,
            "BFNFT__FManager__CantBetDuringFight"
        );
        await expect(
            BFNFTFightsManagerClient2.setBet({
                value: betInEthers,
            })
        ).to.be.revertedWithCustomError(
            BFNFTFightsManagerContract,
            "BFNFT__FManager__CantBetDuringFight"
        );
    });

    it("declareWinner(): Only owner can call it.", async () => {
        await expect(
            BFNFTFightsManagerClient1.declareWinner(fightId, client1, [
                client1,
                client2,
            ])
        ).to.be.reverted;
        await expect(
            BFNFTFightsManagerClient2.declareWinner(fightId, client2, [
                client1,
                client2,
            ])
        ).to.be.reverted;
    });

    it("declareWinner(): Player set as winner recieves the price and event is emitted correctly.", async () => {
        let prevBalanceC1, prevBalanceC2;
        if (inLocalhost) {
            prevBalanceC1 = await provider.getBalance(client1);
            prevBalanceC2 = await provider.getBalance(client2);
        }
        const txResponse = await BFNFTFightsManagerContract.declareWinner(
            fightId,
            client1,
            [client1, client2]
        );
        // Checking event emitted correctly.
        const txReceipt = await txResponse.wait();
        const txBlock = txReceipt.blockNumber;
        const query = await BFNFTFightsManagerContract.queryFilter(
            fightResultEventFilter,
            txBlock
        );
        const fightIdSet = query[0].args[0];
        const winner = query[0].args[1];
        const prize = query[0].args[2];
        assert.deepEqual(fightId, fightIdSet);
        assert.deepEqual(client1, winner);
        // Expect both bets from players added together. In this tests players always bet 0.1 sETH
        const expectedPrice = await ethers.parseEther("0.2");
        assert.equal(prize, expectedPrice);
        if (inLocalhost) {
            await delay(1000);
            const currentBalanceC1 = await provider.getBalance(client1);
            assert.isAbove(currentBalanceC1, prevBalanceC1);

            const currentBalanceC2 = await provider.getBalance(client2);
            assert.equal(currentBalanceC2, prevBalanceC2);
        }
    });

    it("declareWinner(): Fight settings are reseted.", async () => {
        let fightState = await BFNFTFightsManagerContract.getIsFightActive(
            fightId
        );
        assert.equal(fightState, false);
    });

    it("startFight(): Tickets of players must be higher than 0.", async () => {
        const ticketsC1later = await getTicketsOfAsInt(client1);
        await BFNFTFightsManagerClient1.setBet({ value: betInEthers });
        await BFNFTFightsManagerClient2.setBet({ value: betInEthers });
        await allowStartFight(client1, startFightValues);

        await expect(
            BFNFTFightsManagerClient1.startFight(
                [client1, client2],
                [1, 0],
                [betInEthers, betInEthers]
            )
        ).to.be.revertedWithCustomError(
            BFNFTFightsManagerContract,
            "BFNFT__FManager__PlayerHasNoTitckets"
        );
    });

    it("startFight(): If a bet sent is lower than agreed, tickets to 0 penalty is applied all bets are returned and event emited correctly.", async () => {
        // Player 1 wont set the bet correctly, should eventually be punished.
        await BFNFTFightsManagerClient1.setBet({ value: 0 });
        await buyXTickets(client1, 3);
        const ticketsOfC1prev = await getTicketsOfAsInt(client1);
        assert.notEqual(0, ticketsOfC1prev);

        await allowStartFight(client2, startFightValues);
        await buyXTickets(client2, 1);
        await BFNFTFightsManagerClient2.setBet({ value: betInEthers });

        let prevBalanceC1, prevBalanceC2;
        if (inLocalhost) {
            prevBalanceC1 = await provider.getBalance(client1);
            // If await delay(1000); is written from here or below the tests will just halt idk why.
            // --> await delay(1000);
            prevBalanceC2 = await provider.getBalance(client2);
        }
        const ticketsOfC2prev = await getTicketsOfAsInt(client2);

        // Client2 which bet as it should wants to start but 1 doesn't bet.
        const txResponse = await BFNFTFightsManagerClient2.startFight(
            [client1, client2],
            [1, 0],
            [betInEthers, betInEthers]
        );
        const txReceipt = await txResponse.wait();
        const txBlock = txReceipt.blockNumber;
        const query = await BFNFTFightsManagerContract.queryFilter(
            betReturnedFilter,
            txBlock
        );
        const recievedBack = query[1].args[1];
        assert.equal(recievedBack, betInEthers);
        const recievedBackP1 = query[0].args[1];
        assert.equal(recievedBackP1, await ethers.parseEther("0"));

        // Client 1 can't call startFight now.
        await expect(
            BFNFTFightsManagerClient1.startFight(
                [client1, client2],
                [1, 0],
                [betInEthers, betInEthers]
            )
        ).to.be.reverted;

        // Client 2 behave properly so it's bet is returned.
        if (inLocalhost) {
            // Super weird, if added a delay higher than 78, in any part above this test
            // then code just halts in line pointed with an arrow ->
            // await delay(1000);
            const currentBalanceC2 = await provider.getBalance(client2);
            /* --> */ assert.equal(currentBalanceC2, prevBalanceC2);
            const currentBalanceC1 = await provider.getBalance(client1);
            assert.equal(currentBalanceC1, prevBalanceC1);
        }

        // Client 1 didnt bet what he said, punishment tickets go to 0.
        const ticketsOfC1 = await getTicketsOfAsInt(client1);
        // Client 2 should have same tickets.
        assert.equal(0, ticketsOfC1);
        const ticketsOfC2 = await getTicketsOfAsInt(client2);
        assert.equal(ticketsOfC2prev, ticketsOfC2);
    });

    it("buyTicket(): Must pay the correct price.", async () => {
        const badPrice = await ethers.parseEther(
            await (prices.fightTicket - 0.01).toString()
        );
        await expect(
            BFNFTFightsManagerClient1.buyTicket({ value: badPrice })
        ).to.be.revertedWithCustomError(
            BFNFTFightsManagerContract,
            "BFNFT__FManager__NotPayedEnough"
        );
    });

    it("withdrawAllowedFunds(): Only owner withdraws and only withdraws funds from ticket income and event emitted correctly..", async () => {
        // Clients can't call withdraw
        await expect(BFNFTFightsManagerClient1.withdrawAllowedFunds()).to.be
            .reverted;

        // Checking if money arrives to address.
        let prevBalance;
        if (inLocalhost) {
            prevBalance = await provider.getBalance(deployer);
        }
        await buyXTickets(client1, 1);
        await buyXTickets(client2, 1);
        let txResponse =
            await BFNFTFightsManagerContract.withdrawAllowedFunds();
        let txReceipt = await txResponse.wait();
        let recieved = await getRecievedMoneyInWithdrawn(txResponse);
        assert.notEqual(recieved, await ethers.parseEther("0"));

        let newBalance;
        if (inLocalhost) {
            await delay(1000);
            newBalance = await provider.getBalance(deployer);
            assert.isAbove(newBalance, prevBalance);
        }

        // Withdrawal before fight, only withdraws ticket amounts.
        prevBalance = newBalance;
        await buyXTickets(client1, 1);
        await buyXTickets(client2, 1);
        await BFNFTFightsManagerClient1.setBet({ value: betInEthers });
        await BFNFTFightsManagerClient2.setBet({ value: betInEthers });
        txResponse = await BFNFTFightsManagerContract.withdrawAllowedFunds();
        txReceipt = await txResponse.wait();
        recieved = await getRecievedMoneyInWithdrawn(txResponse);
        assert.equal(recieved, await ethers.parseEther("0.2"));
        if (inLocalhost) {
            await delay(1000);
            newBalance = await provider.getBalance(deployer);
            let retired = newBalance - prevBalance;
            assert.isAtMost(retired, await ethers.parseEther("0.2"));
        }
        // Withdrawal during fight, only withdraws ticket amounts.
        prevBalance = newBalance;
        await buyXTickets(client1, 1);
        await buyXTickets(client2, 1);
        await allowStartFight(client1, startFightValues);
        await allowStartFight(client2, startFightValues);
        await BFNFTFightsManagerClient1.startFight(
            [client1, client2],
            [1, 0],
            [betInEthers, betInEthers]
        );
        txResponse = await BFNFTFightsManagerContract.withdrawAllowedFunds();
        txReceipt = await txResponse.wait();
        recieved = await getRecievedMoneyInWithdrawn(txResponse);
        assert.equal(recieved, await ethers.parseEther("0.2"));
        if (inLocalhost) {
            await delay(1000);
            newBalance = await provider.getBalance(deployer);
            assert.isAbove(newBalance, prevBalance);
            retired = newBalance - prevBalance;
            assert.isAtMost(retired, await ethers.parseEther("0.2"));
        }
        // Withdrawal after fight, only withdraws ticket amounts.
        prevBalance = newBalance;
        await buyXTickets(client1, 1);
        await buyXTickets(client2, 1);
        await BFNFTFightsManagerContract.declareWinner(fightId, client1, [
            client1,
            client2,
        ]);
        txResponse = await BFNFTFightsManagerContract.withdrawAllowedFunds();
        txReceipt = await txResponse.wait();
        recieved = await getRecievedMoneyInWithdrawn(txResponse);
        assert.equal(recieved, await ethers.parseEther("0.2"));
        if (inLocalhost) {
            await delay(1000);
            newBalance = await provider.getBalance(deployer);
            assert.isAbove(newBalance, prevBalance);
            retired = newBalance - prevBalance;
            assert.isAtMost(retired, await ethers.parseEther("0.2"));
        }
        // Withdrawal before fight with invalid bets, only withdraws ticket amounts.
        prevBalance = newBalance;
        await delay(1500);
        await buyXTickets(client1, 1);
        await buyXTickets(client2, 1);
        await BFNFTFightsManagerClient1.setBet({ value: betInEthers });
        await allowStartFight(client1, startFightValues);
        await allowStartFight(client2, startFightValues);
        txResponse = await BFNFTFightsManagerContract.withdrawAllowedFunds();
        txReceipt = await txResponse.wait();
        recieved = await getRecievedMoneyInWithdrawn(txResponse);
        assert.equal(recieved, await ethers.parseEther("0.2"));
        await BFNFTFightsManagerClient2.startFight(
            [client1, client2],
            [1, 0],
            [betInEthers, betInEthers]
        );
        await expect(
            BFNFTFightsManagerClient1.startFight(
                [client1, client2],
                [1, 0],
                [betInEthers, betInEthers]
            )
        ).to.be.reverted;
        if (inLocalhost) {
            await delay(2000);
            newBalance = await provider.getBalance(deployer);
            assert.isAbove(newBalance, prevBalance);
            retired = newBalance - prevBalance;
            assert.isAtMost(retired, await ethers.parseEther("0.2"));
        }

        // Withdrawal after fight with invalid bets, only withdraws ticket amounts.
        prevBalance = newBalance;
        await buyXTickets(client1, 1);
        await buyXTickets(client2, 1);
        await BFNFTFightsManagerClient1.setBet({ value: betInEthers });
        await allowStartFight(client1, startFightValues);
        await allowStartFight(client2, startFightValues);
        await BFNFTFightsManagerClient2.startFight(
            [client1, client2],
            [1, 0],
            [betInEthers, betInEthers]
        );
        await expect(
            BFNFTFightsManagerClient1.startFight(
                [client1, client2],
                [1, 0],
                [betInEthers, betInEthers]
            )
        ).to.be.reverted;
        txResponse = await BFNFTFightsManagerContract.withdrawAllowedFunds();
        txReceipt = await txResponse.wait();
        recieved = await getRecievedMoneyInWithdrawn(txResponse);
        assert.equal(recieved, await ethers.parseEther("0.2"));
        if (inLocalhost) {
            await delay(1000);
            newBalance = await provider.getBalance(deployer);
            assert.isAbove(newBalance, prevBalance);
            retired = newBalance - prevBalance;
            assert.isAtMost(retired, await ethers.parseEther("0.2"));
        }
    });
});
