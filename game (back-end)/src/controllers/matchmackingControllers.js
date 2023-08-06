const logger = require("../logs/logger");
const {
    createChallenge,
    deleteChallenge,
    getRandomChallenges,
    sendOfferToChallenge,
    deleteOfferToChallenge,
    dealDoneHanldeStartFightPermissions,
} = require("../services/matchmakingServices");

const {
    broadcastMatchmakingState,
    notifyAcceptedChallengesUpdate,
    notifySendYourBet,
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
        const { nftId, betAmount } = req.body;
        const nftIdS = await nftId.toString();
        const playerAddress = req.user.address;

        if (!nftIdS || !betAmount) {
            return res.status(400).json({
                message: "All fields required, fields are: nftId, betAmount",
            });
        }
        const response = await createChallenge(playerAddress, nftId, betAmount);
        if (!response) {
            return res.status(400).json({
                message: "An error occured creating the challenge",
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

exports.sendOfferToChallenger = async (req, res, next) => {
    try {
        const { challengerAddress, challengeeNftId, challengeeBetAmount } =
            req.body;
        const nftIdS = await challengeeNftId.toString();
        const playerAddress = req.user.address;

        if (!challengerAddress || !nftIdS || !challengeeBetAmount) {
            return res.status(400).json({
                message:
                    "All fields required, fields are: challengerAddress, challengeeNftId, challengeeBetAmount",
            });
        }
        let response = await sendOfferToChallenge(
            playerAddress,
            challengerAddress,
            challengeeBetAmount,
            nftIdS
        );
        if (!response.success) {
            return res.status(400).json({
                message: response.message,
            });
        }
        response = await notifyAcceptedChallengesUpdate(challengerAddress);
        if (!response.success) {
            // Add function to undeo sendOfferTOCHallnege
            return res.status(400).json({
                message: response.message,
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

exports.removeOfferToChallenger = async (req, res, next) => {
    try {
        // Getting data
        const { challengerAddress } = req.body;
        const playerAddress = req.user.address;
        if (!challengerAddress) {
            return res.status(400).json({
                message: "All fields required, fields are: challengerAddress",
            });
        }

        // Function calls
        let response = await deleteOfferToChallenge(
            playerAddress,
            challengerAddress
        );
        // Modularize this checks?
        if (!response.success) {
            return res.status(400).json({
                message: response.message,
            });
        }
        const finalMessage = response.message;
        response = await notifyAcceptedChallengesUpdate(challengerAddress);
        if (!response.success) {
            return res.status(400).json({
                message: response.message,
            });
        }
        res.status(200).json({
            message: finalMessage,
        });
    } catch (error) {
        next(error);
    }
};

exports.acceptOfferStartFight = async (req, res, next) => {
    try {
        const { opponentAddress, nftId2 } = req.body;
        const nftIdS2 = await nftId2.toString();
        const playerAddress = req.user.address;

        if (!playerAddress || !opponentAddress || !nftIdS2) {
            return res.status(400).json({
                message:
                    "All fields required, fields are: opponentAddress, nftId2",
            });
        }

        const result = await dealDoneHanldeStartFightPermissions(
            playerAddress,
            opponentAddress,
            nftIdS2
        );
        if (!result.success) {
            return res.status(400).json({
                message: result.message,
            });
        }
        // console.log(result)
        const fightOnChainData = result.data.fightOnChainData;
        console.log("Controller on chain data recieved");
        console.log(fightOnChainData);
        notified = await notifySendYourBet(opponentAddress, fightOnChainData);
        if (!notified.success) {
            return res.status(400).json({
                message:
                    "Failed to notify bets sendings. Try again in around 1 minute.",
            });
        }
        notified = await notifySendYourBet(playerAddress, fightOnChainData);
        if (!notified.success) {
            return res.status(400).json({
                message:
                    "Failed to notify bets sendings. Try again in around 1 minute.",
            });
        }
        res.status(200).json({
            message: "All ready get ready to fight!",
        });
    } catch (error) {
        next(error);
    }
};
