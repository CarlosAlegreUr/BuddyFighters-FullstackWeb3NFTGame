// changeStatsControllers.js
const {
    requestChange,
    generateNewStatsURIAndAllowClient,
} = require("../services/changeStatsServices");

// Controller for a route to request a change
exports.requestChange = async (req, res) => {
    try {
        const playerAddress = req.body.playerAddress;
        if (!playerAddress) {
            return res
                .status(400)
                .json({ message: "Player address is required." });
        }
        await requestChange(playerAddress);
        console.log("controller executed");
        res.status(200).json({
            message:
                "Change requested successfully, now you have 2.5mins to generate your random numbers.",
        });
    } catch (error) {
        res.status(500).send(
            "Something went wrong in requestChange() service!"
        );
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
