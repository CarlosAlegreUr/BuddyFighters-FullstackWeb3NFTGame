// serverConfig/server.js
// Initialize dotenv
const dotenv = require("dotenv");
dotenv.config();

// Initialize express
const express = require("express");
const app = express();

// Middleware

// Logger: Express-Wiston
const logger = require("../logs/logger");
app.use((req, res, next) => {
    logger.info(`HTTP ${req.method} ${req.url}`);
    next();
});

// CORS
const cors = require("cors");
app.use(cors({ credentials: true, origin: process.env.CORS_ORIGIN }));

// JSON converter
app.use(express.json());

// Auth: JWT verifycation. Check code in middleware.

// Cookie parser, JWT are sent via cookies.
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// SSE seems to need this
const compression = require("compression");
app.use(compression());

// Database
const connectDB = require("../database/connect");
connectDB();

// Routes
const authRoutes = require("../routes/authRoutes");
const changeStatsRoutes = require("../routes/changeStatsRoutes");
const matchmakingRoutes = require("../routes/matchmakingRoutes");
// const fightManagementRoutes = require("../routes/fightManagementRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/changeStats", changeStatsRoutes);
app.use("/api/matchmaking", matchmakingRoutes);
// app.use("/api/fightManagement", verifyToken, fightManagementRoutes);

// Error handling
app.use((err, req, res, next) => {
    logger.error(
        `HTTP ${req.method} ${req.url} ${res.statusCode} ${err.message} ERROR STACK: ${err.stack}`
    );

    res.status(500).send("Something went wrong!!!");
});

// Start server
const port = process.env.PORT || 3005;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;
