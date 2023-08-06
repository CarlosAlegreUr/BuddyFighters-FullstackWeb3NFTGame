import React, { useState, useEffect } from "react";

export default function ChallengeOfferForm({ opponent, updateFormSignal }) {
  const [offerDetails, setOfferDetails] = useState({
    opponent: opponent || "",
    offeredBetAmount: "",
    chellengueeNftId: "",
  });

  useEffect(() => {
    setOfferDetails((prevState) => ({
      ...prevState,
      opponent: opponent,
    }));
  }, [updateFormSignal]);

  const sendOffer = async () => {
    const { opponent, offeredBetAmount, chellengueeNftId } = offerDetails;

    console.log(`Sending offer to ${opponent}`);
    console.log(`Offering this amount: ${offeredBetAmount}`);

    const response = await fetch(
      "http://localhost:3005/api/matchmaking/sendOfferToChallenger",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          challengerAddress: opponent,
          challengeeNftId: Number(chellengueeNftId),
          challengeeBetAmount: Number(offeredBetAmount),
        }),
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error:", errorData.message);
    }
  };

  const cancelOffer = async () => {
    const { opponent } = offerDetails;

    console.log(`Canceling offer made to ${opponent}`);

    const response = await fetch(
      "http://localhost:3005/api/matchmaking/removeOfferToChallenger",
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          challengerAddress: opponent,
        }),
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error:", errorData.message);
    } else {
      console.log("Offer deleted.");
    }
  };

  const handleInputChange = (e) => {
    setOfferDetails({
      ...offerDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendOffer();
  };

  return (
    <section>
      <form onSubmit={handleSubmit}>
        <label>
          Opponent:
          <input
            type="text"
            name="opponent"
            value={offerDetails.opponent}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Your Bet Amount:
          <input
            type="number"
            name="offeredBetAmount"
            value={offerDetails.offeredBetAmount}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Your NFT ID:
          <input
            type="number"
            name="chellengueeNftId"
            value={offerDetails.chellengueeNftId}
            onChange={handleInputChange}
            required
          />
        </label>
        <button type="submit">Send Offer</button>
        <button
          type="button"
          onClick={async () => {
            await cancelOffer();
          }}
        >
          Cancel Offer
        </button>
      </form>
    </section>
  );
}
