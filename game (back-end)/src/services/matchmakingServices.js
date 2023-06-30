const {
    getTickets,
    startFight,
} = require("../blockchainScripts/fightManagerFuncs");

const { generateFightId } = require("../utils/fightsFunctions");

const Challenge = require("../database/models/matchmakingModel");
const Fight = require("../database/models/fightModel");

async function createChallenge(playerAddress, nftId, bidAmount) {
    try {
        const hasTickets = await getTickets(playerAddress);
        if (hasTickets) {
            const only1 = await Challenge.findOne({ playerAddress });
            if (!only1) {
                const newChallenge = new Challenge({
                    playerAddress,
                    nftId,
                    bidAmount,
                });
                const res = await newChallenge.save();
                return true;
            }
            return false;
        } else return false;
    } catch (err) {
        throw err;
    }
}

async function deleteChallenge(playerAddress) {
    try {
        const deleteResult = await Challenge.deleteOne({
            playerAddress: playerAddress,
        });
        if (deleteResult.deletedCount >= 1) return true;
        else return false;
    } catch (err) {
        throw err;
    }
}

async function getRandomChallenges(addressToAvoid = "", count = 3) {
    try {
        const challenges = await Challenge.aggregate([
            { $match: { playerAddress: { $ne: addressToAvoid } } },
            { $sample: { size: count } },
        ]);
        return challenges;
    } catch (err) {
        throw err;
    }
}

async function acceptChallenge(
    playerAddress,
    opponentAddress,
    offeredBidAmount,
    ourNftId
) {
    try {
        const result = await Challenge.updateOne(
            { playerAddress: opponentAddress },
            {
                $push: {
                    accepted: {
                        opponentAddress: playerAddress,
                        offeredBidAmount: offeredBidAmount,
                        opponentNftId: ourNftId,
                    },
                },
            }
        );
        console.log(`Accepted updated for: ${opponentAddress}`);
        if (result.modifiedCount === 1) {
            return true;
        } else return false;
    } catch (err) {
        throw err;
    }
}

async function getAcceptedChallenges(playerAddress) {
    try {
        const challenge = await Challenge.findOne({
            playerAddress: playerAddress,
        });
        if (challenge) {
            return challenge.accepted;
        } else return false;
    } catch (err) {
        throw err;
    }
}

async function dealDoneStartFight(
    playerAddress,
    opponentAddress,
    nftId1,
    p1bet
) {
    try {
        // Chekn in playerAddress Challenge object if opponent exists in accepted challengues array.
        // Save in DB corresponding Fight object
        // Program agenda job to call start fight in smart contract in 2.5min. If not all players ready
        // agenda job also deletes Fight object from datbase and resets fight in blockchain.
        // If both players get ready another agenda job will be called and this one canceled, but this
        // is not anymore in this funciton
    } catch (err) {
        throw err;
    }
}

module.exports = {
    createChallenge,
    deleteChallenge,
    getRandomChallenges,
    acceptChallenge,
    getAcceptedChallenges,
    dealDoneStartFight,
};
