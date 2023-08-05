const sseConnections = require("../middleware/sseConnections");
const {
    getRandomChallenges,
    getAcceptedChallenges,
} = require("./matchmakingServices");

const { formatReturn } = require("../utils/returns");

async function broadcastMatchmakingState() {
    for (const [playerAddress, sse] of Object.entries(sseConnections)) {
        const challenges = await getRandomChallenges(playerAddress);
        if (challenges && challenges.length) {
            await sse.send({
                event: "challengesList",
                data: challenges,
            });
        } else {
            await sse.send({
                event: "challengesList",
                data: [],
            });
        }
    }
}

async function notifyClient(addresOfClient, message) {
    try {
        const send = { message: message };
        const sse = sseConnections[addresOfClient];
        await sse.send({
            event: "takeActionsInfo",
            data: send,
        });
        return true;
    } catch (err) {
        throw err;
    }
}

async function notifyAcceptance(addressOfClientToNotify) {
    try {
        const sse = sseConnections[addressOfClientToNotify];
        const challenges = await getAcceptedChallenges(addressOfClientToNotify);
        if (challenges) {
            await sse.send({
                event: "acceptedChallenge",
                data: challenges,
            });
            return true;
        } else {
            await sse.send({
                event: "error",
                data: "Oponent doesnt have any challenge posted!",
            });
            return false;
        }
    } catch (err) {
        throw err;
    }
}

async function notifySendYourBet(addresOfClient, fightData) {
    try {
        const notification = `Your offer has been accepted! Send your bet quick! Any player
        can start the fight in 15 seconds from now!`;
        const sse = sseConnections[addresOfClient];
        await sse.send({
            event: "sendBet",
            data: { notification: notification, fightData: fightData },
        });
        return await formatReturn(true, "Notification sent");
    } catch (err) {
        throw err;
    }
}

module.exports = {
    broadcastMatchmakingState,
    notifyClient,
    notifySendYourBet,
    notifyAcceptance,
};
