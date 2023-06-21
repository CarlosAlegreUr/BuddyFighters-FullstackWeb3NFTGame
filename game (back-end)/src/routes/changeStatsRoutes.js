const express = require("express");
const router = express.Router();
const changeStatsController = require("../controllers/changeStatsControllers");

// Route for client to request change
router.post("/requestChange", changeStatsController.requestChange);

// Route for client to generate a new stats URI and allow the client
router.post(
    "/allowURIChange",
    changeStatsController.generateNewStatsURIAndAllowClient
);

module.exports = router;
