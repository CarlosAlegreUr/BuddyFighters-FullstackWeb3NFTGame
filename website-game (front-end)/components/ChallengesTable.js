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
            <td>{challenges[key].playerAddress}</td>
            <td>{challenges[key].nftId}</td>
            <td>{challenges[key].bidAmount}</td>
            <td>
              <button onClick={() => onAccept(challenges[key].playerAddress)}>
                Accept
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
