const logger = require("../logs/logger");
const {
    createChallenge,
    deleteChallenge,
    getRandomChallenges,
    acceptChallenge,
    acceptSomeonesChallenge,
} = require("../services/matchmakingServices");

const {
    broadcastMatchmakingState,
    notifyAcceptance,
} = require("../services/matchmakingNotifyService");

const SSE = require("express-sse");
const sseConnections = require("../middleware/sseConnections");

// Client calls this, backend checks if he indeed placed the bet. Also checks if other player is confirmed to have
// placed the bet. I all true backend sets blockchain fight state to in progress. // Create fight state in DB.
exports.fightStarted = async (req, res, next) => {
    try {
    } catch (error) {
        next(error);
    }
};

// Player makes a move, bakcend chekcs if fight is active, if it is updates fight state in DB.
// Check if other player has made his move, this is checked in DB.
// If both moved:
// If still noone list send back palyer current state of fight.
// If results in finishing move resets everything, pays winner and sends back by SSE results to players.
exports.playerDecision = async (req, res, next) => {
    try {
    } catch (error) {
        next(error);
    }
};
