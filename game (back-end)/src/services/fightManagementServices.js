const {
    generateFightId,
    calculateDamage,
} = require("../utils/fightsFunctions");

// Checks in database fight state and sets player sent to true ready
// Also checks if other player is confirmed to have, if both are ready undo agenda job for database elimination
// If timing ends job should check which one didnt bet and revoke only tickets from the one who didnt win
// Returns "ready" if all players ready
async function setPlayerReady(playerAddress) {}

// Applies player decision to turn
async function playTurnForPlayer(playerAddress, decision) {}

module.exports = { setPlayerReady, playTurnForPlayer };
