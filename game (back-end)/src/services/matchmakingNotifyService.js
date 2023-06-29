const sseConnections = require("../middleware/sseConnections");
const { getRandomChallenges } = require("./matchmakingServices");

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

module.exports = { broadcastMatchmakingState };
