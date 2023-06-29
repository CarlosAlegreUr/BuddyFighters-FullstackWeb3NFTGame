const sseConnections = require("./sseConnections");

const checkSSEConnection = (req, res, next) => {
    try {
        const playerAddress = req.user.address;
        const sse = sseConnections[playerAddress];
        if (!sse) {
            return res.status(400).json({
                message: "You don't have an established connection.",
            });
        }
        req.sse = sse;
        next();
    } catch (err) {
        throw err;
    }
};

module.exports = checkSSEConnection;
