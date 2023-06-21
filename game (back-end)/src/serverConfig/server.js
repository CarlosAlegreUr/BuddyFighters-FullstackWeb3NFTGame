// serverConfig/server.js
const express = require("express");
const connectDB = require("../database/connect");
const cors = require("cors");
const logger = require("../logs/logger");

// const passport = require("passport");
// const JwtStrategy = require("passport-jwt").Strategy;
const dotenv = require("dotenv");

// Initialize dotenv
dotenv.config();

// Initialize express
const app = express();

// Middleware

// Express-Wiston Logger
app.use((req, res, next) => {
    logger.info(`HTTP ${req.method} ${req.url}`);
    next();
});

// CORS
app.use(
    cors({
        origin: "http://localhost:3000", // only allow requests from this origin
    })
);

// JSON converter
app.use(express.json());

// Passport.js
// app.use(passport.initialize());

// Passport JWT strategy
// let opts = {};
// opts.jwtFromRequest = function (req) {
//     // Provide the way to extract JWT from request
//     let token = null;
//     if (req && req.cookies) token = req.cookies["jwt"];
//     return token;
// };
// opts.secretOrKey = process.env.JWT_SECRET; // Define your secret or key

// passport.use(
//     new JwtStrategy(opts, function (jwt_payload, done) {
//         // In this callback, you would verify if the JWT payload is valid
//         // ...
//     })
// );

// Database
connectDB();

// Routes
// const matchmakingRoutes = require("../routes/matchmakingRoutes");
// const mintRoutes = require("../routes/mintRoutes");
const changeStatsRoutes = require("../routes/changeStatsRoutes");
// const fightManagementRoutes = require("../routes/fightManagementRoutes");

// app.use("/api/matchmaking", matchmakingRoutes);
// app.use("/api/mint", mintRoutes);
app.use("/api/changeStats", changeStatsRoutes);
// app.use("/api/fightManagement", fightManagementRoutes);

// Error handling
app.use((err, req, res, next) => {
    logger.error(
        `HTTP ${req.method} ${req.url} ${res.statusCode} ${err.message} ERROR STACK: ${err.stack}`
    );

    res.status(500).send("Something went wrong!");
    next(err); // Passing the error forward.
});

// Start server
const port = process.env.PORT || 3005;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
