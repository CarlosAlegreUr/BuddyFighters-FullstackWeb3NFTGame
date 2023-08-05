import React, { useState } from "react";

export default function ChallengeManagement() {
  const [betAmount, setBetAmount] = useState(0);
  const [nftId, setNftId] = useState(0);

  const postChallenge = async () => {
    const response = await fetch(
      "http://localhost:3005/api/matchmaking/postChallenge",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nftId: nftId,
          betAmount: betAmount,
        }),
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      console.log("Error occurred:", errorData.message);
    } else {
      const data = await response.json();
      console.log("Success:", data);
    }
  };

  const deleteChallenge = async () => {
    const response = await fetch(
      "http://localhost:3005/api/matchmaking/deleteChallenge",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response);
  };

  return (
    <section>
      <h4> You can only have 1 challenge at a time my dear </h4>
      <form>
        <label htmlFor="betAmount">Bet Amount:</label>
        <input
          type="number"
          id="betAmount"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
        />

        <label htmlFor="nftId">NFT ID:</label>
        <input
          type="number"
          id="nftId"
          value={nftId}
          onChange={(e) => setNftId(e.target.value)}
        />

        <button
          onClick={async (e) => {
            e.preventDefault();
            await postChallenge();
          }}
        >
          POST CHALLENGE
        </button>
      </form>

      <br />

      <button
        onClick={async () => {
          await deleteChallenge();
        }}
      >
        DELETE CHALLENGE
      </button>
    </section>
  );
}
