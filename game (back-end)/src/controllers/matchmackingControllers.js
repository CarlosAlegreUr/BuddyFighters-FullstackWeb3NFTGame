const logger = require("../logs/logger");
const {
    createChallenge,
    deleteChallenge,
    getRandomChallenges,
    acceptChallenge,
    dealDoneHanldeStartFightPermissions,
    faildToNotifyRetireAllowance,
} = require("../services/matchmakingServices");

const {
    broadcastMatchmakingState,
    notifyAcceptance,
    notifySendYourBet
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
                message: "All fields required, fields are: nftId, betAmount",
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
        const { opponentAddress, nftId, betAmount } = req.body;
        const nftIdS = await nftId.toString();
        const playerAddress = req.user.address;

        if (!opponentAddress || !nftIdS || !betAmount) {
            return res.status(400).json({
                message:
                    "All fields required, fields are: opponentAddress, nftId, betAmount",
            });
        }
        let result = await acceptChallenge(
            playerAddress,
            opponentAddress,
            betAmount,
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

exports.acceptOfferStartFight = async (req, res, next) => {
    try {
        const { opponentAddress, nftId1, nftId2 } = req.body;
        const nftIdS1 = await nftId1.toString();
        const nftIdS2 = await nftId2.toString();
        const playerAddress = req.user.address;

        if (!playerAddress || !opponentAddress || !nftIdS1 || !nftIdS2) {
            return res.status(400).json({
                message:
                    "All fields required, fields are: opponentAddress, nftId1, nftId2",
            });
        }

        const notification = `You have 1min!!! For calling setBet() with the money as value and when
        the minute passes call startFight() with the correct inputs.`;
        let notified = await notifyAcceptance(playerAddress, notification);
        notified = await notifyAcceptance(opponentAddress, notification);
        if (!notified) {
            return res.status(400).json({
                message:
                    "Failed to notify, no start fight permissions will be given.",
            });
        }

        const result = await dealDoneHanldeStartFightPermissions(
            playerAddress,
            opponentAddress,
            nftIdS1,
            nftIdS2
        );
        if (!result) {
            return res.status(400).json({
                goFight: false,
                message: "Something failed whrn accepting the challenge.",
            });
        }
        notified = await notifySendYourBet(opponentAddress);
        if (!notified) {
            await faildToNotifyRetireAllowance(
                playerAddress,
                opponentAddress,
                nftId1,
                nftId2
            );
            return res.status(400).json({
                message:
                    "Failed to notify bets setting. No start fight permissions will be given.",
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
