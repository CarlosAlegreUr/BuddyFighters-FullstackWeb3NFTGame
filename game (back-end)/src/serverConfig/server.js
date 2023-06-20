// serverConfig/server.js
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Initialize dotenv
dotenv.config();

// Initialize express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Passport JWT strategy
let opts = {};
opts.jwtFromRequest = function (req) {
    // Provide the way to extract JWT from request
    let token = null;
    if (req && req.cookies) token = req.cookies["jwt"];
    return token;
};
opts.secretOrKey = process.env.JWT_SECRET; // Define your secret or key

passport.use(
    new JwtStrategy(opts, function (jwt_payload, done) {
        // In this callback, you would verify if the JWT payload is valid
        // ...
    })
);

// Routes
const matchmakingRoutes = require("../routes/matchmakingRoutes");
const mintRoutes = require("../routes/mintRoutes");
const changeStatsRoutes = require("../routes/changeStatsRoutes");
const fightManagementRoutes = require("../routes/fightManagementRoutes");

app.use("/api/matchmaking", matchmakingRoutes);
app.use("/api/mint", mintRoutes);
app.use("/api/changeStats", changeStatsRoutes);
app.use("/api/fightManagement", fightManagementRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong!");
});

// Start server
const port = process.env.PORT || 3005;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
