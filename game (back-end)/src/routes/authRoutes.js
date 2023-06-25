const express = require("express");
const router = express.Router();
const authController = require("../controllers/authControllers");

router.get("/nonce", authController.getNonce);
router.post("/authenticate", authController.authenticate);

module.exports = router;
