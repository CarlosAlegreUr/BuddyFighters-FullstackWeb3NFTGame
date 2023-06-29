// ChallengesTable.js
import React from "react";

export default function ChallengesTable({ challenges, onAccept }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Opponent</th>
          <th>NFT ID</th>
          <th>Bet</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {Object.keys(challenges).map((key) => (
          <tr key={key}>
            <td>{challenges[key].opponent}</td>
            <td>{challenges[key].nftId}</td>
            <td>{challenges[key].bet}</td>
            <td>
              <button
                onClick={() =>
                  onAccept(challenges[key].opponent, challenges[key].nftId)
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
