const {
    getTickets,
    getFightId,
} = require("../blockchainScripts/fightManagerFuncs");

const { getTokenUri } = require("../blockchainScripts/changeStats");
const {
    retrieveJsonFromIpfs,
} = require("../utils/blockchainUtils/getIPFSData");

const agenda = require("./agenda");

const Challenge = require("../database/models/matchmakingModel");
const Fight = require("../database/models/fightModel");

async function createChallenge(playerAddress, nftId, betAmount) {
    try {
        const hasTickets = await getTickets(playerAddress);
        if (hasTickets) {
            const only1 = await Challenge.findOne({ playerAddress });
            if (!only1) {
                const newChallenge = new Challenge({
                    playerAddress: playerAddress,
                    nftId: nftId,
                    betAmount: betAmount,
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
    offeredBetAmount,
    ourNftId
) {
    try {
        const result = await Challenge.updateOne(
            { playerAddress: opponentAddress },
            {
                $push: {
                    accepted: {
                        opponentAddress: playerAddress,
                        offeredBetAmount: offeredBetAmount,
                        opponentNftId: ourNftId,
                    },
                },
            }
        );
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

async function dealDoneHanldeStartFightPermissions(
    playerAddress,
    opponentAddress,
    nftId1,
    nftId2
) {
    try {
        // Save in DB corresponding Fight object
        const challenge = await Challenge.findOne({
            playerAddress: playerAddress,
            nftId: nftId1,
        });
        if (!challenge) return false;
        const bet1 = challenge.betAmount;

        const acceptances = challenge.accepted;
        const { offeredBetAmount } = await acceptances.find(
            (obj) =>
                obj.opponentAddress === opponentAddress &&
                obj.opponentNftId.toString() === nftId2
        );
        const bet2 = offeredBetAmount;

        const fId = await getFightId(
            [playerAddress, opponentAddress],
            [nftId1, nftId2]
        );

        const nft1URI = await getTokenUri(nftId1);
        const nft2URI = await getTokenUri(nftId2);
        const token1_Hash = await nft1URI.replace("ipfs://", "");
        const token2_Hash = await nft2URI.replace("ipfs://", "");
        let nftMetadata1 = await retrieveJsonFromIpfs(token1_Hash);
        let nftMetadata2 = await retrieveJsonFromIpfs(token2_Hash);

        const now = new Date();
        const newFight = new Fight({
            fightId: fId,
            player1: playerAddress,
            player2: opponentAddress,
            p1Life: nftMetadata1.attributes[3].value,
            p2Life: nftMetadata2.attributes[3].value,
            p1Ready: false,
            p2Ready: false,
            created_at: now,
        });
        await newFight.save();

        // Execute after 1 minute. Gives permissions to players but first lets them time to
        //send the bets and get ready.
        const waitTime = new Date();
        await waitTime.setMinutes(waitTime.getSeconds() + 3);
        await agenda.schedule(waitTime, "giveStartFightPermissions", {
            playerAddress,
            opponentAddress,
            nftId1,
            nftId2,
            bet1,
            bet2,
        });

        // 45 seconds later permissions check if they started the fight,
        // if didnt, delete permissions and delete fight from database
        const waitTime2 = new Date();
        await waitTime2.setMinutes(waitTime.getMinutes() + 1);
        await agenda.schedule(waitTime2, "deleteIfFightNotStarted", {
            playerAddress,
            opponentAddress,
            fId,
        });
        // Everything was set correctly
        return true;
    } catch (err) {
        throw err;
    }
}

async function faildToNotifyRetireAllowance(player1, player2, nftId1, nftId2) {
    const fId = await getFightId([player1, player2], [nftId1, nftId2]);
    const waitTime2 = new Date();
    await waitTime2.setMinutes(waitTime.getSeconds() + 1);
    await agenda.schedule(waitTime2, "deleteIfFightNotStarted", {
        player1,
        player2,
        fId,
    });
}

module.exports = {
    createChallenge,
    deleteChallenge,
    getRandomChallenges,
    acceptChallenge,
    getAcceptedChallenges,
    dealDoneHanldeStartFightPermissions,
    faildToNotifyRetireAllowance,
};
