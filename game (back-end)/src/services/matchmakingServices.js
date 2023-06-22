const Challenge = require("../database/models/matchmakingModel");
const Fight = require("../database/models/fightModel");
const deployFight = require("../scripts/03-fight");

async function createChallenge(playerAddress, nftId, bidAmount) {
  const newChallenge = new Challenge({ playerAddress, nftId, bidAmount });
  return await newChallenge.save();
}

async function deleteChallenge(playerAddress) {
  await Challenge.deleteOne({ playerAddress });
}

async function getRandomChallenges(count = 3) {
  const challenges = await Challenge.aggregate([{ $sample: { size: count } }]);
  return challenges;
}

async function acceptChallenge(
  playerAddress,
  opponentAddress,
  offeredBidAmount,
  opponentNftId
) {
  await Challenge.updateOne(
    { playerAddress },
    {
      $push: { accepted: { opponentAddress, offeredBidAmount, opponentNftId } },
    }
  );
}

async function getAcceptedChallenges(playerAddress) {
  const challenge = await Challenge.findOne({ playerAddress });
  return challenge ? challenge.accepted : [];
}

async function acceptSomeonesChallenge(
  playerAddress,
  opponentAddress,
  nftId1,
  nftId2
) {
  const MAX_BATTLES_ONLINE = 2;
  const totalFightsCount = await Fight.countDocuments({ isActive: true });
  // Check if servers can support more battles
  if (totalFightsCount < MAX_BATTLES_ONLINE) {
    // Delete the challenge of Player 1
    await Challenge.deleteOne({ playerAddress });

    // Notify the other user he has to start a fight.
    // You would typically use a real-time messaging system such as websockets to accomplish this.

    // Backend notifies both users: Your fight is being deployed please wait.
    // Again, you would typically use a real-time messaging system to accomplish this.

    // Deploy fight (user sees message, deploying fight)
    // This will likely involve some interaction with your smart contract.

    // Send notification, enter fight page.
    // Again, a real-time messaging system would be the way to go.

    // If any user does not accept in 15 seconds, he loses. (backend calls fight contract as admin with the loser address,
    // if both don't enter, he calls it with the challenger address)
    // You might set a timer and have a separate function that checks the acceptance state in your database.

    // Create a new fight using the Fight model
    const fightId = generateFightId(
      playerAddress,
      opponentAddress,
      nftId1,
      nftId2
    );
    const newFight = new Fight({
      fightId,
      player1: playerAddress,
      player2: opponentAddress,
      nftId1,
      nftId2,
      isActive: true,
    });

    const fight = await newFight.save();

    // After 15 seconds, check if users have accepted the fight
    setTimeout(async () => {
      const fightRefreshed = await Fight.findById(fight._id);
      if (!fightRefreshed.player1Accepted || !fightRefreshed.player2Accepted) {
        // End the fight in the blockchain and in your database
      }
    }, 15000);

    return fight;
  } else {
    throw new Error("Fights servers are full now, please try later.");
  }
}


function generateFightId(p1, p2, nftId1, nftId2) {
  return Buffer.from(p1 + p2 + nftId1.toString() + nftId2.toString()).toString(
    "base64"
  );
}

module.exports = {
  createChallenge,
  deleteChallenge,
  getRandomChallenges,
  acceptChallenge,
  getAcceptedChallenges,
  acceptSomeonesChallenge,
};
