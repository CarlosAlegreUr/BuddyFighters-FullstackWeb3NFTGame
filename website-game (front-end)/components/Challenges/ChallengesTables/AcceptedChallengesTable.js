import React from "react";

export default function AcceptedChallengesTable({ challenges }) {
  const startFight = async (opAddress, opBet, opNftid) => {
    console.log("Starting fight! Make sure your connection is good!");
    console.log(`Accepting challenge from ${opAddress} with bet of ${opBet}`);
    console.log("Calling backend to track fight and get permissions.");
    const response = await fetch(
      "http://localhost:3005/api/matchmaking/acceptOfferStartFight",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          opponentAddress: opAddress,
          nftId2: opNftid,
        }),
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error:", errorData.message);
    }
  };

  return (
    <table>
      <thead>
        <tr>
          <th>Opponent</th>
          <th>Bet</th>
          <th>NFT ID</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {Object.keys(challenges).map((key) => (
          <tr key={key}>
            <td>{challenges[key].opponentAddress}</td>
            <td>{challenges[key].offeredBetAmount}</td>
            <td>{challenges[key].opponentNftId}</td>
            <td>
              <button
                onClick={() =>
                  startFight(
                    challenges[key].opponentAddress,
                    challenges[key].offeredBetAmount,
                    challenges[key].opponentNftId
                  )
                }
              >
                Accept and Start Fight
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
