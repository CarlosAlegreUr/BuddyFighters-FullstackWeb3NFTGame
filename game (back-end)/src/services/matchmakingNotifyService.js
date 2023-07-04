const sseConnections = require("../middleware/sseConnections");
const {
    getRandomChallenges,
    getAcceptedChallenges,
} = require("./matchmakingServices");

async function broadcastMatchmakingState() {
    for (const [playerAddress, sse] of Object.entries(sseConnections)) {
        console.log(playerAddress);
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

async function notifyAcceptance(addressOfClientToNotify) {
    const sse = sseConnections[addressOfClientToNotify];
    console.log(`Notifying: ${addressOfClientToNotify}`);
    const challenges = await getAcceptedChallenges(addressOfClientToNotify);
    if (challenges) {
        console.log("Accepting challnges");
        console.log(challenges);
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
}

module.exports = { broadcastMatchmakingState, notifyAcceptance };
