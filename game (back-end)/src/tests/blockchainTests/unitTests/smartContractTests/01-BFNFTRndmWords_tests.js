const { assert, expect } = require("chai");
const { ethers, getNamedAccounts, deployments } = require("hardhat");

describe("BFNFTRndmWords.sol tests", function () {
    let deployer,
        client1,
        VrfCoordinatorV2MockContract,
        BFNFTRndmWordsContractOnly,
        BFNFTRndmWordsContract,
        BFNFTRndmWordsClient,
        reqIdEventFilter,
        numsEventFilter,
        statsEventFilter;
    let reqIdsSoFar = {};

    // Helper functions
    async function requestNumbersAndGetReqId(num) {
        let txResponse = await BFNFTRndmWordsContract.requestRandomNumbers(num);
        let txReceipt = await txResponse.wait();
        let txBlock = txReceipt.blockNumber;
        let query = await BFNFTRndmWordsContract.queryFilter(
            reqIdEventFilter,
            txBlock
        );
        let reqIdBigNum = query[0].args[0];
        let reqId = await ethers.getNumber(reqIdBigNum);
        return reqId;
    }

    async function recieveRandomWordsFromEvents(numOfWords, txReceipt) {
        const filter = numOfWords == 2 ? numsEventFilter : statsEventFilter;
        const txBlock = txReceipt.blockNumber;
        const query = await BFNFTRndmWordsContract.queryFilter(filter, txBlock);
        const wordsBigNumber = query[0].args[0];
        const intWords = wordsBigNumber.map((word) => ethers.toNumber(word));
        return intWords;
    }

    // Tests
    beforeEach(async function () {
        const { deployer: d, client1: c } = await getNamedAccounts();
        deployer = d;
        client1 = c;
        // Contracts with different signers
        VrfCoordinatorV2MockContract = await ethers.getContract(
            "VRFCoordinatorV2Mock",
            deployer
        );
        BFNFTRndmWordsContractOnly = await ethers.getContract("BFNFTRndmWords");
        BFNFTRndmWordsContract = await ethers.getContract(
            "BFNFTRndmWords",
            deployer
        );
        BFNFTRndmWordsClient = await ethers.getContract(
            "BFNFTRndmWords",
            client1
        );
        // Event filters
        reqIdEventFilter = await BFNFTRndmWordsContract.filters
            .BFNFT__RndomWordsRequested;
        numsEventFilter = await BFNFTRndmWordsContract.filters
            .BFNFT__RndomNumsGenerated;
        statsEventFilter = await BFNFTRndmWordsContract.filters
            .BFNFT__RndomStatsGenerated;
    });

    it("requestRandomNumbers(): Only 2 or 6 random words can be requested at a time.", async () => {
        await expect(
            BFNFTRndmWordsContract.requestRandomNumbers(3)
        ).to.be.revertedWithCustomError(
            BFNFTRndmWordsContractOnly,
            "BFNFT__Rndm__RndomNumLengthNotValid"
        );

        await expect(
            BFNFTRndmWordsContract.requestRandomNumbers(7)
        ).to.be.revertedWithCustomError(
            BFNFTRndmWordsContractOnly,
            "BFNFT__Rndm__RndomNumLengthNotValid"
        );
    });

    it("requestRandomNumbers(): Owner can request random numbers anytime.", async () => {
        let reqId = await requestNumbersAndGetReqId(2);
        assert.equal(reqId, 1);
        reqIdsSoFar[reqId] = 2;

        reqId = await requestNumbersAndGetReqId(6);
        assert.equal(reqId, 2);
        reqIdsSoFar[reqId] = 6;
    });

    it("callAllowFuncCallsFor(): Client can only request random numbers once permission is given.", async () => {
        await expect(
            BFNFTRndmWordsClient.requestRandomNumbers(2)
        ).to.be.revertedWithCustomError(
            BFNFTRndmWordsContractOnly,
            "CallOrderControl__NotAllowedCall"
        );

        let funcSig = "requestRandomNumbers(uint32)";
        let hash = await ethers.id(funcSig);
        const funcSelec = await hash.substring(0, 10);
        let txResponse = await BFNFTRndmWordsContract.callAllowFuncCallsFor(
            client1,
            [funcSelec],
            false
        );

        await expect(BFNFTRndmWordsClient.requestRandomNumbers(2)).to.be.not
            .reverted;
        reqIdsSoFar[3] = 2;

        await expect(
            BFNFTRndmWordsClient.requestRandomNumbers(2)
        ).to.be.revertedWithCustomError(
            BFNFTRndmWordsContractOnly,
            "CallOrderControl__NotAllowedCall"
        );
    });

    it("fulfillRandomWords(): Values are generated in correct ranges.", async () => {
        let txResponse =
            await VrfCoordinatorV2MockContract.fulfillRandomWordsWithOverride(
                1,
                await BFNFTRndmWordsContract.getAddress(),
                [0, 150]
            );
        let txReceipt = await txResponse.wait();
        const nums = await recieveRandomWordsFromEvents(
            reqIdsSoFar[1],
            txReceipt
        );

        for (const num of nums) {
            assert.isAtLeast(num, 1);
            assert.isAtMost(num, 151);
        }

        txResponse =
            await VrfCoordinatorV2MockContract.fulfillRandomWordsWithOverride(
                2,
                await BFNFTRndmWordsContract.getAddress(),
                [0, 254, 255, 509, 510, 764]
            );
        txReceipt = await txResponse.wait();
        const stats = await recieveRandomWordsFromEvents(
            reqIdsSoFar[2],
            txReceipt
        );
        for (const num of stats) {
            assert.isAtLeast(num, 1);
            assert.isAtMost(num, 255);
        }
    });
});
