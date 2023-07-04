import React, { useState } from "react";

import { ethers } from "ethers";
import { useMoralis } from "react-moralis";
import { getContractAddress, getContractAbi } from "../utils/getContractInfo";

import ChallengesTable from "./ChallengesTable";

export default function BattleRadarSection() {
  const [sse, setSse] = useState(null);
  const [challenges, setChallenges] = useState({});
  const [acceptedChallengesDisplay, setAcceptedChallengesDisplay] =
    useState(false);

  const sseConnect = async () => {
    try {
      const sseInstance = new EventSource(
        "http://localhost:3005/api/matchmaking/fightradaron",
        { withCredentials: true }
      );

      sseInstance.addEventListener("message", function (event) {
        const eventData = JSON.parse(event.data);
        console.log("Received SSE Event:", eventData);
        console.log("Analyzing frontend response to event");
        if (eventData.event === "challengesList") {
          setChallenges(eventData.data);
          console.log(challenges);
        }
        console.log(`GEEEEEEEY :  ${eventData.data} ${eventData.data.length}`);
        if (eventData.event === "acceptedChallenge") {
          if (eventData.data && eventData.data.length === 0) {
            setAcceptedChallengesDisplay(false);
          } else {
            console.log("Displaying challenges...");
            setAcceptedChallengesDisplay(true);
          }
        }
      });

      setSse(sseInstance);
    } catch (error) {
      console.log(error);
    }
  };

  const acceptChallenge = async (opponent) => {
    console.log(`Accepting challenge from ${opponent}`);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = signer.address;
    const n = address == "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" ? 0 : 1;

    const response = await fetch(
      "http://localhost:3005/api/matchmaking/acceptChallenge",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          opponentAddress: opponent,
          nftId: n,
          bidAmount: 0.1,
        }),
      }
    );
    console.log(response);
  };

  const postC = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = signer.address;
    const nftId =
      address == "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" ? 0 : 1;
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
          bidAmount: 0.2,
        }),
      }
    );
    console.log(response);
  };

  const deleteC = async () => {
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

  const closeConnection = () => {
    if (sse) {
      sse.close();
      setSse(null);
      setChallenges({});
    }
  };

  const payForTicket = async () => {
    alert("This payment is to cover the cost of the project's backend.");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const chainIdBig = await signer.provider.getNetwork();
    const chainId = Number(chainIdBig.chainId);
    const contractAddress = await getContractAddress(
      chainId,
      "BFNFTFightsManager"
    );

    const contractABI = await getContractAbi(chainId, "BFNFTFightsManager");

    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    console.log("Calling ticket function");
    const args = { value: await ethers.parseEther("0.1") };
    const tx = await contract.buyTicket(args);
    await tx.wait();
  };

  return (
    <section>
      <button
        onClick={async () => {
          await sseConnect();
        }}
      >
        ACTIVATE BATTLE RADAR
      </button>
      <button onClick={closeConnection}>TURN OFF BATTLE RADAR</button>
      {sse ? (
        <div>
          <button
            onClick={async () => {
              await payForTicket();
            }}
          >
            BUY FIGHT TICKET
          </button>
          <button
            onClick={async () => {
              await postC();
            }}
          >
            POST CHALLENGE
          </button>
          <button
            onClick={async () => {
              await deleteC();
            }}
          >
            DELETE CHALLENGE
          </button>

          {acceptedChallengesDisplay ? (
            <h1> SOMEONE ACCEPTED CHALLENGE </h1>
          ) : (
            <h1> HEY WHATSAP BRO </h1>
          )}
        </div>
      ) : (
        <></>
      )}

      {sse ? (
        Object.keys(challenges).length > 0 ? (
          <section>
            <h1>Challenges list</h1>
            <ChallengesTable
              challenges={challenges}
              onAccept={acceptChallenge}
            />
          </section>
        ) : (
          <h1> No challenges available </h1>
        )
      ) : (
        <h1> Fight radar not active </h1>
      )}
    </section>
  );
}
