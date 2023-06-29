const {
    getTickets,
    startFight,
} = require("../blockchainScripts/fightManagerFuncs");

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
    opponentNftId
) {
    try {
        const result = await Challenge.updateOne(
            { playerAddress },
            {
                $push: {
                    accepted: {
                        opponentAddress,
                        offeredBidAmount,
                        opponentNftId,
                    },
                },
            }
        );
        if (result.modifiedCount === 1) {
            // Send notification to client via SSE
            // ...
            return true;
        } else return false;
    } catch (err) {
        throw err;
    }
}

async function acceptSomeonesChallenge(
    playerAddress,
    opponentAddress,
    nftId1,
    p1bet
) {
    try {
        // Chekn in playerAddress Challenge object if opponent exists in accepted challengues array.
        // Notify other player fight will start.
        // Establish Socket connection with both.
        // If notified sucessfully create fight in blockchain.
        const started = await startFight();

        // Delete challenge from database.
    } catch (err) {
        throw err;
    }
}

function generateFightId(p1, p2, nftId1, nftId2) {
    return Buffer.from(
        p1 + p2 + nftId1.toString() + nftId2.toString()
    ).toString("base64");
}

module.exports = {
    createChallenge,
    deleteChallenge,
    getRandomChallenges,
    acceptChallenge,
    acceptSomeonesChallenge,
};
