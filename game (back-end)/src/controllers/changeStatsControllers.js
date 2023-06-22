// changeStatsControllers.js
const {
    requestChange,
    generateNewStatsURIAndAllowClient,
    generateRandomStatsInLocalhost,
} = require("../services/changeStatsServices");

// Controller for a route to request a change
exports.requestChange = async (req, res, next) => {
    try {
        const playerAddress = req.body.playerAddress;
        if (!playerAddress) {
            return res
                .status(400)
                .json({ message: "Player address is required." });
        }
        await requestChange(playerAddress);
        res.status(200).json({
            message:
                "Change requested successfully, now you have 2.5mins to generate your random numbers.",
        });
    } catch (error) {
        next(error);
    }
};

// Controller for a route to generate a new stats URI and allow the client
exports.generateNewStatsURIAndAllowClient = async (req, res) => {
    try {
        const { playerAddress, nftId, rndmNumsReqId } = req.body;
        if (!playerAddress || !nftId || !rndmNumsReqId) {
            return res
                .status(400)
                .json({ message: "All fields are required." });
        }
        const newTokenUri = await generateNewStatsURIAndAllowClient(
            playerAddress,
            nftId,
            rndmNumsReqId
        );
        res.status(200).json({ newTokenUri });
    } catch (error) {
        res.status(500).send(
            "Something went wrong in generateNewStatsURIAndAllowClient() service!"
        );
    }
};

// Controller only used in localhost to tell backend to generate stats
exports.generateRandomStats = async (req, res, next) => {
    try {
        const reqId = req.body.reqId;
        if (!reqId) {
            return res.status(400).json({ message: "reqId is required." });
        }
        await generateRandomStatsInLocalhost(reqId);
        res.status(200).json({
            message: "Stats generation was successful.",
        });
    } catch (error) {
        next(error);
    }
};
