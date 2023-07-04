const express = require("express");
const router = express.Router();
const fightManagementControllers = require("../controllers/fightManagementControllers");
const verifyToken = require("../middleware/authMiddleware");
const checkSSEConnection = require("../middleware/connectionsMiddleware");

router.use(verifyToken);
router.use(checkSSEConnection);

router.post("/readyForFight", fightManagementControllers.readyToFight);
router.post("/playTurn", fightManagementControllers.playTurn);

module.exports = router;
