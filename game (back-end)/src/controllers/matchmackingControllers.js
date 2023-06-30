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

exports.establishSSEConnectionAndSendChallenges = async (req, res, next) => {
    try {
        const playerAddress = req.user.address;
        let sse = new SSE();
        sseConnections[playerAddress] = sse;
        await sse.init(req, res);
        logger.info(`SSE CONNECTION, PLAYER: ${playerAddress}`);

        // Send available challenges
        const challenges = await getRandomChallenges(playerAddress);

        if (challenges && challenges.length) {
            return await sse.send({
                event: "challengesList",
                data: challenges,
            }); // Send the challenges through SSE
        } else {
            return await sse.send({
                event: "challengesList",
                data: [],
            }); // Send the result through SSE
        }
    } catch (error) {
        next(error);
    }
};

exports.postChallenge = async (req, res, next) => {
    try {
        const { nftId, bidAmount } = req.body;
        const nftIdS = await nftId.toString();
        const playerAddress = req.user.address;
        if (!nftIdS || !bidAmount) {
            return res.status(400).json({
                message: "All fields required, fields are: nftId, bidAmount",
            });
        }
        const response = await createChallenge(playerAddress, nftId, bidAmount);
        if (!response) {
            return res.status(400).json({
                message: "All fields required, fields are: nftId, bidAmount",
            });
        }
        await broadcastMatchmakingState();
        return res.status(200).json({
            message: "Challenge posted!",
        });
    } catch (error) {
        next(error);
    }
};

exports.removeChallenge = async (req, res, next) => {
    try {
        const playerAddress = req.user.address;
        const response = await deleteChallenge(playerAddress);
        if (!response) {
            return res.status(400).json({
                message: "Challenge doesn't exist!",
            });
        }
        await broadcastMatchmakingState();
        res.status(200).json({
            message: "Challenge deleted!",
        });
    } catch (error) {
        next(error);
    }
};

exports.acceptChallenge = async (req, res, next) => {
    try {
        const { opponentAddress, nftId } = req.body;
        const nftIdS = await nftId.toString();
        const playerAddress = req.user.address;

        if (!opponentAddress || !nftIdS) {
            return res.status(400).json({
                message:
                    "All fields required, fields are: opponentAddress, nftId",
            });
        }
        let result = await acceptChallenge(
            playerAddress,
            opponentAddress,
            nftId
        );
        result = await notifyAcceptance(opponentAddress);
        if (!result) {
            return res.status(400).json({
                message:
                    "Failed to accept the challenge, either server couldnt notify the oponent or the challenge is not available anymore.",
            });
        }
        res.status(200).json({
            message:
                "Challenge accepted and oponent notified, wait for it's answer.",
        });
    } catch (error) {
        next(error);
    }
};

exports.acceptSomeonesChallenge = async (req, res, next) => {
    try {
        const { playerAddress, opponentAddress, nftId1, nftId2 } = req.body;

        if (!playerAddress || !opponentAddress || !nftId1 || !nftId2) {
            return res.status(400).json({
                message:
                    "All fields required, fields are: playerAddress, opponentAddress, nftId1, nftId2",
            });
        }

        // TODO:
        // Notify both users to DEPOSIT BETS IN BLOCKCHAIN, START FIGHT IN BLOCKCHAIN AND CALL FIGHT ENDPOINT!
        // Also send them the battle info to display in battle page

        const result = await dealDoneStartFight(
            playerAddress,
            opponentAddress,
            nftId1,
            nftId2
        );
        if (!result) {
            return res.status(400).json({
                goFight: false,
                message: "Failed to accept the challenge.",
            });
        }
        res.status(200).json({
            goFight: true,
            message: "Challenge accepted get ready to fight!",
        });
    } catch (error) {
        next(error);
    }
};
