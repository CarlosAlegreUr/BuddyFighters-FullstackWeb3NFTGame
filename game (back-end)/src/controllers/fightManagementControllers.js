// const logger = require("../logs/logger");

const { setPlayerReady } = require("../services/fightManagementServices");

const SSE = require("express-sse");
const sseConnections = require("../middleware/sseConnections");

// Check when both ready if battle is inded started in blockchain.
exports.readyToFight = async (req, res, next) => {
    try {
        const playerAddress = req.user.address;

        // Should return [bool] => success value => All players ready result == "ready"
        let result = await setPlayerReady(playerAddress);
        if (!result) {
            return res.status(400).json({
                message: "Idk mate something went wrong.",
            });
        }
        if (result === "ready") {
            return res.status(200).json({
                message: "FIGHT HAS OFFICIALLY STARTED!",
            });
        }
        return res.status(200).json({
            message: "YOUR PARTICIPATION HAS BEEN CONFIRMED",
        });
    } catch (error) {
        next(error);
    }
};

// Player makes a move, bakcend chekcs if fight is active, if it is updates fight state in DB.
// Check if other player has made his move, this is checked in DB.
// If both moved:
// If still noone list send back palyer current state of fight.
// If results in finishing move resets everything, pays winner and sends back by SSE results to players.
exports.playTurn = async (req, res, next) => {
    try {
        const { decision } = req.body;
        const playerAddress = req.user.address;

        const result = await playTurnForPlayer(playerAddress, decision);
    } catch (error) {
        next(error);
    }
};

function generateFightId(p1, p2, nftId1, nftId2) {
    return Buffer.from(
        p1 + p2 + nftId1.toString() + nftId2.toString()
    ).toString("base64");
}
