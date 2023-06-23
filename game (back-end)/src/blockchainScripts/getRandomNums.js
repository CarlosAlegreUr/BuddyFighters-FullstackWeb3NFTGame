const { ethers, getNamedAccounts, network } = require("hardhat");
const { developmentNets } = require("../helper-hardhat-config");

async function geteRandomNumsLocalhost(generateNums, generateStats, reqId) {
    const onDevNet = await developmentNets.includes(network.name);
    if (onDevNet) {
        const { deployer } = await getNamedAccounts();
        const bfnftRndmWords = await ethers.getContract(
            "BFNFTRndmWords",
            deployer
        );

        // Generating random numbers and stats.
        // RANDOMNESS IS NOT DECENTRALIZED WHEN IN LOCALHOST NETWORK
        let num1,
            num2,
            stats = [];

        let query, txResponse, requestId, txReceipt, txBlock;
        const VRFCoordinatorV2MockContract = await ethers.getContract(
            "VRFCoordinatorV2Mock",
            deployer
        );

        if (generateNums) {
            // Pokemon Nums
            txResponse =
                await VRFCoordinatorV2MockContract.fulfillRandomWordsWithOverride(
                    await requestId.toNumber(),
                    bfnftRndmWords.address,
                    [
                        parseInt(Math.random() * 1000),
                        parseInt(Math.random() * 1000),
                    ]
                );
            txReceipt = await txResponse.wait();
            txBlock = txReceipt.blockNumber;
            let randomNumbersFilter = await bfnftRndmWords.filters
                .BFNFT__RndomNumsGenerated;
            query = await bfnftRndmWords.queryFilter(
                randomNumbersFilter,
                txBlock,
                txBlock
            );
            num1 = query[0].args.rndmNums[0];
            num2 = query[0].args.rndmNums[1];
        }

        if (generateStats) {
            // Stats
            txResponse =
                await VRFCoordinatorV2MockContract.fulfillRandomWordsWithOverride(
                    reqId,
                    bfnftRndmWords.address,
                    [
                        parseInt(Math.random() * 1000),
                        parseInt(Math.random() * 1000),
                        parseInt(Math.random() * 1000),
                        parseInt(Math.random() * 1000),
                        parseInt(Math.random() * 1000),
                        parseInt(Math.random() * 1000),
                    ]
                );
            txReceipt = await txResponse.wait();
            txBlock = txReceipt.blockNumber;
            randomNumbersFilter = await bfnftRndmWords.filters
                .BFNFT__RndomStatsGenerated;
            query = await bfnftRndmWords.queryFilter(
                randomNumbersFilter,
                txBlock,
                txBlock
            );
            stats = query[0].args.rndmNums;
        }

        return { num1: num1, num2: num2, stats: stats };
    }
}

// Returns the nums values if found, if not found returns a boolean with the value false.
async function getRandmNumsFromEvents(clientAddress, requestId) {
    try {
        // TODO:
        // Use TheGraph services to query events values from testnet.
        let found = false;
        let num1, num2;
        let stats = [];
        if (found) return { num1: num1, num2: num2, stats: stats };
        else return false;
    } catch (error) {
        throw error;
    }
}

// Function only used when testing.
async function requAndGenRandomTesting(generateNums, generateStats) {
    const onDevNet = developmentNets.includes(network.name);
    const blocksToWait = onDevNet ? 1 : 6;
    const { deployer } = await getNamedAccounts();

    const bfnftRndmWords = await ethers.getContract("BFNFTRndmWords", deployer);

    let num1,
        num2,
        stats = [];

    if (onDevNet) {
        let query, txResponse, requestId, txReceipt, txBlock;
        const VRFCoordinatorV2MockContract = await ethers.getContract(
            "VRFCoordinatorV2Mock",
            deployer
        );
        const mockEventFilter = await VRFCoordinatorV2MockContract.filters
            .RandomWordsRequested;

        if (generateNums) {
            txResponse = await bfnftRndmWords.requestRandomNumbers(2);
            txReceipt = await txResponse.wait(blocksToWait);

            txBlock = txReceipt.blockNumber;
            query = await VRFCoordinatorV2MockContract.queryFilter(
                mockEventFilter,
                txBlock
            );
            requestId = query[0].args.requestId;

            // Pokemon Nums
            txResponse =
                await VRFCoordinatorV2MockContract.fulfillRandomWordsWithOverride(
                    await requestId.toNumber(),
                    bfnftRndmWords.address,
                    [
                        parseInt(Math.random() * 1000),
                        parseInt(Math.random() * 1000),
                    ]
                );
            txReceipt = await txResponse.wait();
            txBlock = txReceipt.blockNumber;
            let randomNumbersFilter = await bfnftRndmWords.filters
                .BFNFT__RndomNumsGenerated;
            query = await bfnftRndmWords.queryFilter(
                randomNumbersFilter,
                txBlock,
                txBlock
            );
            num1 = query[0].args.rndmNums[0];
            num2 = query[0].args.rndmNums[1];
        }

        if (generateStats) {
            // Stats
            txResponse = await bfnftRndmWords.requestRandomNumbers(6);
            txReceipt = await txResponse.wait(blocksToWait);
            txBlock = txReceipt.blockNumber;

            query = await VRFCoordinatorV2MockContract.queryFilter(
                mockEventFilter,
                txBlock
            );
            requestId = query[0].args.requestId;
            txResponse =
                await VRFCoordinatorV2MockContract.fulfillRandomWordsWithOverride(
                    await requestId.toNumber(),
                    bfnftRndmWords.address,
                    [
                        parseInt(Math.random() * 1000),
                        parseInt(Math.random() * 1000),
                        parseInt(Math.random() * 1000),
                        parseInt(Math.random() * 1000),
                        parseInt(Math.random() * 1000),
                        parseInt(Math.random() * 1000),
                    ]
                );
            txReceipt = await txResponse.wait();
            txBlock = txReceipt.blockNumber;
            randomNumbersFilter = await bfnftRndmWords.filters
                .BFNFT__RndomStatsGenerated;
            query = await bfnftRndmWords.queryFilter(
                randomNumbersFilter,
                txBlock,
                txBlock
            );
            stats = query[0].args.rndmNums;
        }
    }
    return { num1: num1, num2: num2, stats: stats };
}

module.exports = {
    geteRandomNumsLocalhost,
    getRandmNumsFromEvents,
    requAndGenRandomTesting,
};
