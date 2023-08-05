import React from "react";

import AcceptedChallengesTable from "./AcceptedChallengesTable";

export default function AcceptedChallengesSection({ acceptedChallenges }) {
  return (
    <section>
      {!(
        Object.keys(acceptedChallenges).length === 0 &&
        acceptedChallenges.constructor === Object
      ) ? (
        <div>
          <h1> OFFERS TO YOUR CHALLENGE </h1>
          <section>
            <h1> Offers list </h1>
            <AcceptedChallengesTable challenges={acceptedChallenges} />
          </section>
        </div>
      ) : (
        <h1> NO OFFERS FOR YOUR CHALLENGE YET </h1>
      )}
    </section>
  );
}
