import React, { useState } from "react";

import { ethers } from "ethers";
import { useMoralis } from "react-moralis";
import { getContractAddress, getContractAbi } from "../utils/getContractInfo";

import ChallengesTable from "./ChallengesTable";
import AcceptedChallengesTable from "./AcceptedChallengesTable";
import { sign } from "crypto";

export default function BattleRadarSection() {
  const [sse, setSse] = useState(null);
  const [challenges, setChallenges] = useState({});
  const [acceptedChallengesDisplay, setAcceptedChallengesDisplay] =
    useState(false);
  const [acceptedChallenges, setAcceptedChallenges] = useState({});
  const [displayFightButton, setDisplayFightButton] = useState(false);
  const [displayStartFightButton, setDisplayStartFightButton] = useState(false);

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
          console.log("Challenges available:");
          console.log(challenges);
        }
        if (eventData.event === "acceptedChallenge") {
          if (eventData.data && eventData.data.length === 0) {
            setAcceptedChallengesDisplay(false);
          } else {
            console.log("Displaying accepted challenges...");
            setAcceptedChallenges(eventData.data);
            setAcceptedChallengesDisplay(true);
          }
        }

        if (eventData.event === "sendBet") {
          console.log("Send bet button activated");
          setDisplayStartFightButton(true);
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
    const n = address == "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" ? 0 : 1;

    const response = await fetch(
      "http://localhost:3005/api/matchmaking/sendOfferToChallenger",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          opponentAddress: opponent,
          nftId: n,
          betAmount: 0.1,
        }),
      }
    );
    console.log(response);
  };

  const startFight = async (opAddress, bet, opnftid) => {
    console.log("Starting fight! Make sure your connection is good!");
    console.log(`Accepting challenge from ${opAddress} with bet of ${bet}`);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = signer.address;
    const n1 = address == "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" ? 0 : 1;

    console.log("Calling backend to track fight and get permissions.");
    const response = await fetch(
      "http://localhost:3005/api/matchmaking/acceptOfferStartFight",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          opponentAddress: opAddress,
          nftId1: n1,
          nftId2: opnftid,
        }),
      }
    );
    console.log(response);
    alert("You got 1 minute to send your bet and start the fight.");
    setTimeout(async () => {
      await callStartFightContract(opAddress, n1, opnftid);
    }, 4200); // Delayed execution for 1 minute (60000 milliseconds = 1 minute)
  };

  const callStartFightContract = async (opAddress, nftid1, nftid2) => {
    alert(
      "The following transactions are for sending the bet and starting the fight."
    );
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const chainIdBig = await signer.provider.getNetwork();
    const chainId = Number(chainIdBig.chainId);
    const contractABI = await getContractAbi(chainId, "BFNFTFightsManager");
    const contractAddress = await getContractAddress(
      chainId,
      "BFNFTFightsManager"
    );
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    const bet = "0.1";
    const betValue = await ethers.parseEther(bet);
    alert("The following payament is for sending the bet.");
    let tx = await contract.setBet({ value: betValue });
    await tx.wait();

    // Makes the following code execute after 1 minute
    alert(`The following payment is for starting fight. Don't worry if reverts,
        that means your fight was already started. But if no one starts it you both will
        lose all your tickets. :D`);
    console.log("Tx in coming");
    console.log(signer.address);
    console.log(opAddress);
    console.log(nftid1);
    console.log(nftid2);
    console.log(betValue);
    tx = await contract.startFight(
      [signer.address, opAddress],
      [nftid1, nftid2],
      [betValue, betValue]
    );
    console.log(tx);
    setDisplayFightButton(true);
    console.log("All done don't worry about last tx not succeeding. GO FIGHT!");
  };

  const sendBet = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const chainIdBig = await signer.provider.getNetwork();
    const chainId = Number(chainIdBig.chainId);
    const contractABI = await getContractAbi(chainId, "BFNFTFightsManager");
    const contractAddress = await getContractAddress(
      chainId,
      "BFNFTFightsManager"
    );
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    const bet = "0.1";
    const betValue = await ethers.parseEther(bet);
    alert("The following payament is for sending the bet.");
    let tx = await contract.setBet({ value: betValue });
    await tx.wait();
  };

  const postC = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = signer.address;
    const nftId =
      address == "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" ? 0 : 1;
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
          betAmount: 0.1,
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
      setAcceptedChallenges({});
      setDisplayFightButton(false);
      setDisplayStartFightButton(false);
    }
  };

  const payForTicket = async () => {
    alert("This payment is to cover the cost of the project's backend.");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const chainIdBig = await signer.provider.getNetwork();
    const chainId = await Number(chainIdBig.chainId);
    const contractAddress = await getContractAddress(
      chainId,
      "BFNFTFightsManager"
    );

    const contractABI = await getContractAbi(chainId, "BFNFTFightsManager");

    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    console.log("Calling buy ticket function");
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
            <div>
              <h1> SOMEONE ACCEPTED CHALLENGE </h1>
              <section>
                <h1>Accepted Challenges list</h1>
                <AcceptedChallengesTable
                  challenges={acceptedChallenges}
                  onAccept={startFight}
                />
              </section>
            </div>
          ) : (
            <h1> NONE OF YOUR POSTED CHALLENGES HAS BEEN ACCEPTED YET </h1>
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

      {displayFightButton ? (
        <button> GO FIGHT! </button>
      ) : (
        <button> NO FIGHT FOR NOW MATE </button>
      )}

      {displayStartFightButton ? (
        <button
          onClick={async () => {
            await sendBet();
          }}
        >
          SEND YOUR BET
        </button>
      ) : (
        <button> . </button>
      )}
    </section>
  );
}
