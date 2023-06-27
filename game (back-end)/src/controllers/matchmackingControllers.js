const {
    createChallenge,
    deleteChallenge,
    getRandomChallenges,
    acceptChallenge,
    acceptSomeonesChallenge,
} = require("../services/matchmakingServices");

exports.postChallenge = async (req, res, next) => {
    try {
        const { playerAddress, nftId, bidAmount } = req.body;

        if (!playerAddress || !nftId || !bidAmount) {
            return res.status(400).json({
                message:
                    "All fields required, fields are: playerAddress, nftId, bidAmount",
            });
        }
        const response = await createChallenge(playerAddress, nftId, bidAmount);
        if (!response) {
            return res.status(400).json({
                message: "You don't have enought tickets!",
            });
        }
        res.status(200).json({
            message: "Challenge posted!",
        });
    } catch (error) {
        next(error);
    }
};

exports.removeChallenge = async (req, res, next) => {
    try {
        const { playerAddress, nftId, bidAmount } = req.body;

        if (!playerAddress || !nftId || !bidAmount) {
            return res.status(400).json({
                message:
                    "All fields required, fields are: playerAddress, nftId, bidAmount",
            });
        }
        const response = await deleteChallenge(playerAddress, nftId, bidAmount);
        if (!response) {
            return res.status(400).json({
                message: "Challenge doesn't exist!",
            });
        }
        res.status(200).json({
            message: "Challenge deleted!",
        });
    } catch (error) {
        next(error);
    }
};

exports.getChallenges = async (req, res, next) => {
    try {
        const challenges = await getRandomChallenges();
        const returnValue = challenges
            ? challenges
            : "No challenges available.";
        res.status(200).json({
            returnValue,
        });
    } catch (error) {
        next(error);
    }
};

exports.acceptChallenge = async (req, res, next) => {
    try {
        const { playerAddress, opponentAddress, nftId1, nftId2 } = req.body;

        if (!playerAddress || !opponentAddress || !nftId1 || !nftId2) {
            return res.status(400).json({
                message:
                    "All fields required, fields are: playerAddress, opponentAddress, nftId1, nftId2",
            });
        }
        const result = await acceptChallenge(
            playerAddress,
            opponentAddress,
            nftId1,
            nftId2
        );
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
        const result = await acceptSomeonesChallenge(
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
