const express = require("express");
const router = express.Router();
const matchmackingController = require("../controllers/matchmackingControllers");
const verifyToken = require("../middleware/authMiddleware");

router.use(verifyToken);

router.get(
    "/fightradaron",
    matchmackingController.establishSSEConnectionAndSendChallenges
);

const checkSSEConnection = require("../middleware/connectionsMiddleware");
router.use(checkSSEConnection);

router.post("/postChallenge", matchmackingController.postChallenge);
router.post("/deleteChallenge", matchmackingController.removeChallenge);
router.post("/acceptChallenge", matchmackingController.acceptChallenge);
router.post(
    "/acceptSomeonesChallenge",
    matchmackingController.acceptSomeonesChallenge
);

module.exports = router;
