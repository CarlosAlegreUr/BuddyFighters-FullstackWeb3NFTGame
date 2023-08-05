import React, { useState } from "react";

import ChallengeManagement from "./ChallengeManagement";
import ChallengesTable from "./ChallengesTable";
import ChallengeOfferForm from "./ChallengeOfferForm";
import AcceptedChallengesSection from "./AcceptedChallengesSection";

export default function ChallengesSection({ challenges, acceptedChallenges }) {
  const [offerDetailsParamHelper, setOfferDetailsParamHelper] = useState({
    opponent: "",
  });

  const [updateFormSignal, setUpdateFormSignal] = useState(false);

  async function updateOfferParamenters(opponent) {
    setOfferDetailsParamHelper({
      ...offerDetailsParamHelper,
      opponent: opponent,
    });
    setUpdateFormSignal(!updateFormSignal);
  }

  return (
    <section>
      <ChallengeManagement />
      {Object.keys(challenges).length > 0 ? (
        <section>
          <h1>Challenges list</h1>
          <ChallengesTable
            challenges={challenges}
            offerDetailsParamHelper={offerDetailsParamHelper}
            updateOfferParamenters={updateOfferParamenters}
          />
        </section>
      ) : (
        <h1> No challenges available </h1>
      )}
      <ChallengeOfferForm
        opponent={offerDetailsParamHelper.opponent}
        updateFormSignal={updateFormSignal}
      />
      <AcceptedChallengesSection acceptedChallenges={acceptedChallenges} />
    </section>
  );
}
