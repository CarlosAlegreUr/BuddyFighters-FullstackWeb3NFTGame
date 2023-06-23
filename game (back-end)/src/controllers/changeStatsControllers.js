// changeStatsControllers.js
const {
    requestChange,
    generateNewURIAndAllowClient,
} = require("../services/changeStatsServices");

const { checkAndUpdatePayment } = require("../services/checkPayementService");
const { getNewUri } = require("../services/getNewUriService");
const {
    prices,
    callingCheckPaymentsFrom,
} = require("../businessConstants.json");

// Controller for a route to request a change
exports.requestChange = async (req, res, next) => {
    try {
        const { playerAddress, blockPaymentNum } = req.body.playerAddress;
        if (!playerAddress || !blockPaymentNum) {
            return res.status(400).json({
                message:
                    "All fields are required: playerAddress, blockPaymentNum",
            });
        }

        const payed = await checkAndUpdatePayment(
            blockPaymentNum,
            prices.changeStatsPrice,
            playerAddress,
            callingCheckPaymentsFrom.changeStatsFunc
        );
        if (!payed) {
            return res.status(405).json({
                message: dintPayMessage,
            });
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
exports.generateNewURIAndAllowClient = async (req, res) => {
    try {
        const { playerAddress, nftId, rndmNumsReqId, blockPaymentNum } =
            req.body;
        if (!playerAddress || !nftId || !rndmNumsReqId || !blockPaymentNum) {
            return res.status(400).json({
                message:
                    "All fields required, fields are: playerAddress, nftId, rndmNumsReqId, blockPaymentNum ",
            });
        }
        const payed = await checkAndUpdatePayment(
            blockPaymentNum,
            prices.changeStatsPrice,
            playerAddress,
            callingCheckPaymentsFrom.updateURI
        );
        if (!payed) {
            return res.status(400).json({
                message: dintPayMessage,
            });
        }
        const newTokenUri = await generateNewURIAndAllowClient(
            playerAddress,
            nftId,
            rndmNumsReqId
        );
        res.status(200).json({ newTokenUri });
    } catch (error) {
        res.status(500).send(
            "Something went wrong in generateNewURIAndAllowClient() service!"
        );
    }
};

exports.payedButMaliciousActorFound = async (req, res) => {
    try {
        const { playerAddress } = req.body;
        if (!playerAddress) {
            return res.status(400).json({
                message: "All fields are required: playerAddress",
            });
        }
        const newTokenUri = await getNewUri(playerAddress);
        res.status(200).json({ newTokenUri });
    } catch (error) {
        res.status(500).send(
            "Something went wrong in payedButMaliciousActorFound() service!"
        );
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
