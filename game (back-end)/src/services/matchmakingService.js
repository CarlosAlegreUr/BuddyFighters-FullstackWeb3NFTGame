const Challenge = require("../databse/models/matchmakingModel");
const Fight = require("../databse/models/fightModel");

async function createChallenge(playerAddress, bidAmount) {
  const newChallenge = new Challenge({ playerAddress, bidAmount });
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
  // Delete the challenge of Player 1
  await Challenge.deleteOne({ playerAddress });

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

  return await newFight.save();
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
