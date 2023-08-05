const {
    getTickets,
    getFightId,
} = require("../blockchainScripts/fightManagerFuncs");

const { getTokenUri } = require("../blockchainScripts/changeStats");
const {
    retrieveJsonFromIpfs,
} = require("../utils/blockchainUtils/getIPFSData");
const { formatReturn } = require("../utils/returns");

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

async function sendOfferToChallenge(
    playerAddress,
    challengerAddress,
    offeredBetAmount,
    challengueeNftId
) {
    try {
        const challenge = await Challenge.findOne({
            playerAddress: challengerAddress,
        });

        // Limit set so databse occupies little space.
        if (challenge.accepted.length >= 4) {
            return await formatReturn(
                false,
                "Challenge doesn't accept more offers."
            );
        }

        // Only 1 offer per player.
        const acceptances = await challenge.accepted;
        const onlyOneOfferPerPlayer = await acceptances.find(
            (obj) => obj.opponentAddress === playerAddress
        );
        if (onlyOneOfferPerPlayer) {
            return await formatReturn(false, "You already sent an offer.");
        }

        const result = await Challenge.updateOne(
            { playerAddress: challengerAddress },
            {
                $push: {
                    accepted: {
                        opponentAddress: playerAddress,
                        offeredBetAmount: offeredBetAmount,
                        opponentNftId: challengueeNftId,
                    },
                },
            }
        );

        if (result.modifiedCount === 1) {
            return await formatReturn(true, "Offer updated correctly.");
        } else {
            return await formatReturn(false, "Error updating offers array.");
        }
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
    nftId2
) {
    try {
        const numberOfFights = await Fight.countDocuments();
        if (numberOfFights >= 2) {
            return await formatReturn(
                false,
                "System doesn't support more fights."
            );
        }

        // Save in DB corresponding Fight object
        // Gathering the data for the Fight object
        const challenge = await Challenge.findOne({
            playerAddress: playerAddress,
        });
        if (!challenge) return false;
        const nftId1 = challenge.nftId;
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

        // Saving the Fight object
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

        // Executes after 15:
        // Gives permissions to players but first
        // lets them time to send the bets and get ready.
        // If clients don't send the bets and this executes,
        // the other client can call startFight() in the contract and if
        // one of them didnt send the bet yet, he will lose his fight tickets.
        const waitTime = new Date();
        waitTime.setSeconds(waitTime.getSeconds() + 2);
        await agenda.schedule(waitTime, "giveStartFightPermissions", {
            playerAddress,
            opponentAddress,
            nftId1,
            nftId2,
            bet1,
            bet2,
        });

        // 40 seconds later permissions check if they started the fight,
        // if didnt, deletes permissions and deletes Fight from database
        const waitTime2 = new Date();
        waitTime2.setSeconds(waitTime2.getSeconds() + 55);
        await agenda.schedule(waitTime2, "deleteIfFightNotStarted", {
            playerAddress,
            opponentAddress,
            fId,
        });

        const fightDataForStartFightOnChain = {
            fightId: fId,
            p1: playerAddress,
            p2: opponentAddress,
            nft1: nftId1,
            nft2: nftId2,
            bet1: bet1,
            bet2: bet2,
        };
        // Everything was set correctly
        return {
            success: true,
            message:
                "All god starting fight in backend, now you start it on the blockchain.",
            data: {
                fightOnChainData: fightDataForStartFightOnChain,
            },
        };
    } catch (err) {
        throw err;
    }
}

module.exports = {
    createChallenge,
    deleteChallenge,
    getRandomChallenges,
    sendOfferToChallenge,
    getAcceptedChallenges,
    dealDoneHanldeStartFightPermissions,
};
