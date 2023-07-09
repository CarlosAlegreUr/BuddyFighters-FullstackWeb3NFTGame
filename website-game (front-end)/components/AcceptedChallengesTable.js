// ChallengesTable.js
import React from "react";

export default function AcceptedChallengesTable({ challenges, onAccept }) {
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
                  onAccept(
                    challenges[key].opponentAddress,
                    challenges[key].offeredBetAmount,
                    challenges[key].opponentNftId
                  )
                }
              >
                Accept
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
