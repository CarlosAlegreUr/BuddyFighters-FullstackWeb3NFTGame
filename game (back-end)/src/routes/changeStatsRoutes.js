const express = require("express");
const router = express.Router();
const changeStatsController = require("../controllers/changeStatsControllers");

// Route for client to request change
router.post("/requestChange", changeStatsController.requestChange);

// Route for client to generate a new stats URI and allow the client
router.post(
    "/allowURIChange",
    changeStatsController.generateNewURIAndAllowClient
);

// Route for clients to get their new URIs when changing stats, if this is ever called malicious actor might be
// trying to mess with the system or just with the client.
router.post("/getNewUri", changeStatsController.payedButMaliciousActorFound);

module.exports = router;
