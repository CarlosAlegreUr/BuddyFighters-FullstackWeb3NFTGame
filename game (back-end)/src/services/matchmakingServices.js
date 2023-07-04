const {
    getTickets,
    startFight,
} = require("../blockchainScripts/fightManagerFuncs");

const { getTokenUri } = require("../blockchainScripts/changeStats");
const {
    retrieveJsonFromIpfs,
} = require("../utils/blockchainUtils/getIPFSData");
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
        });
        if (!challenge) return false;
        const acceptances = challenge.accepted;
        const bet1 = acceptances.betAmount;
        const { offeredBetAmount: bet2 } = await acceptances.find(
            (obj) =>
                obj.opponentAddress === opponentAddress &&
                obj.opponentNftId === nftId2
        );

        const fId = await generateFightId(
            playerAddress,
            opponentAddress,
            nftId1,
            nftId2
        );

        const nft1URI = await getTokenUri(nftId1);
        const nft2URI = await getTokenUri(nftId2);
        const token1_Hash = await nft1URI.replace("ipfs://", "");
        const token2_Hash = await nft2URI.replace("ipfs://", "");
        let { attributes: attr1 } = await retrieveJsonFromIpfs(token1_Hash);
        let { attributes: attr2 } = await retrieveJsonFromIpfs(token2_Hash);

        const newFight = new Fight({
            fightId: fId,
            player1: playerAddress,
            player2: opponentAddress,
            p1Life: attr1["HP"],
            p2Life: attr2["HP"],
            p1Ready: false,
            p2Ready: false,
            created_at: new Date(),
        });
        await newFight.save();

        // Execute after 1 minute. Gives permissions to players but first lets them time to
        //send the bets and get ready.
        const waitTime = new Date();
        await waitTime.setMinutes(waitTime.getMinutes() + 1);
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
        await waitTime2.setMinutes(waitTime.getSeconds() + 45);
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

module.exports = {
    createChallenge,
    deleteChallenge,
    getRandomChallenges,
    acceptChallenge,
    getAcceptedChallenges,
    dealDoneHanldeStartFightPermissions,
};
