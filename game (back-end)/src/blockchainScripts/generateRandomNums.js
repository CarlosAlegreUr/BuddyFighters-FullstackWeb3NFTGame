const { ethers, getNamedAccounts, network } = require("hardhat");
const { developmentNets } = require("../helper-hardhat-config");

module.exports = async function (generateNums, generateStats) {
    let success = [false, "Some error occurred"];
    const onDevNet = developmentNets.includes(network.name);
    const blocksToWait = onDevNet ? 1 : 6;
    const { deployer } = await getNamedAccounts();

    if (!onDevNet && network.name != "goerli") {
        success[0] = false;
        success[1] =
            "This network is not supported, only Goerli or Localhost networks are.";
        return success;
    }

    const bfnftRndmWords = await ethers.getContract("BFNFTRndmWords", deployer);

    // Generating random numbers and stats.
    // FOR NOW RANDOMNESS IS NOT DECENTRALIZED
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
    } else {
        // TODO: Call VRF contracts on testnet.
        // TODO: And in testnet numbers are in event logs, loop trough them till finding or use TheGraph.
    }

    return { num1: num1, num2: num2, stats: stats };
};
