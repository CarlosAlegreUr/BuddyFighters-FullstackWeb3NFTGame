// changeStatsControllers.js
const {
    requestChange,
    generateNewURIAndAllowClient,
} = require("../services/changeStatsServices");

const { prices } = require("../businessConstants.json");

// Controller for a route to request a change
exports.requestChange = async (req, res, next) => {
    try {
        const playerAddress = req.user.address;
        const response = await requestChange(playerAddress);
        if (!response) {
            return res.status(400).json({ message: "You don't have tickets" });
        }
        res.status(200).json({
            message:
                "Change requested successfully, now you have 2.5mins to generate your random numbers.",
        });
    } catch (error) {
        next(error);
    }
};

// Controller for a route to generate a new stats URI and allow the client
exports.generateNewURIAndAllowClient = async (req, res, next) => {
    try {
        const { nftId, rndmNumsReqId } = req.body;
        const playerAddress = req.user.address;

        if (!nftId || !rndmNumsReqId) {
            return res.status(400).json({
                message:
                    "All fields required, fields are: nftId, rndmNumsReqId ",
            });
        }
        const newTokenUri = await generateNewURIAndAllowClient(
            playerAddress,
            nftId,
            rndmNumsReqId
        );
        if (!newTokenUri) {
            return res.status(400).json({ message: "You don't have tickets" });
        }
        res.status(200).json({ newTokenUri });
    } catch (error) {
        next(error);
    }
};

const dintPayMessage = `You didn't pay or didn't pay enough sorry you lost it start again an pay 
enough this time. Current cost of changing stats is: ${prices.changeStatsPrice} of the native coin. If 
you payed enough and this message still shows don't worry you can proceed with the following 
calls and everything will be fine. `;

// If user pays enough but that payment is registered as payed in the databse that might be because
// a malicious agent called requestChange() before them and is trying to mess with them. Code in the
// backend and offical web page interactions are designed to not care about this scenario and keep working
// fine for the user.
