// ChallengesTable.js
import React from "react";

export default function ChallengesTable({
  challenges,
  updateOfferParamenters,
}) {
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
            <td>{challenges[key].betAmount}</td>
            <td>
              <button
                onClick={async () => {
                  await updateOfferParamenters(challenges[key].playerAddress);
                }}
              >
                CHOOSE CHALLENGE
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// sendOffer(
// challenges[key].playerAddress,
// challenges[key].betAmount,
// challenges[key].nftId
// )
