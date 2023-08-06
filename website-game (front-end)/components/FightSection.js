import React from "react";

import { ethers } from "ethers";
import { getContractAddress, getContractAbi } from "../utils/getContractInfo";
// const fightData = {
// fightId:
// p1:
// p2:
// nft1:
// nft2:
// bet1:
// bet2:
// };

export default function FightSection({ fightData, setShowFightPage }) {
  // Get token URIs from blockchain
  // Retrieve data from IPFS via fetch or axios
  // Set images and make a pretty fight page with that information
  // Make API interaction with backedn via attack defense buttons...

  return (
    <section>
      <button
        onClick={async () => {
          await setShowFightPage(false);
        }}
      >
        GO BACK
      </button>
      <h1> FightID - {fightData.fId}</h1>
      <h1> Plater 1 - {fightData.p1}</h1>
      <h1> Player 2 - {fightData.p2}</h1>
      <h1> Nft of 1 - {fightData.nft1}</h1>
      <h1> Nft of 2 - {fightData.nft2}</h1>
      <h1> 1 bet - {fightData.bet1} ETH</h1>
      <h1> 2 bet - {fightData.bet2} ETH</h1>
    </section>
  );
}
