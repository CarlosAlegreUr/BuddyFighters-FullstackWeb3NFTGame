import React, { useState, useEffect } from "react";

import { ethers } from "ethers";
import { useMoralis } from "react-moralis";
import { getContractAddress, getContractAbi } from "../utils/getContractInfo";

import ChallengesSection from "./Challenges/ChallengesSection";

export default function BattleRadarSection({ setShowFightPage, setFightData }) {
  const [sse, setSse] = useState(null);
  const [challenges, setChallenges] = useState({});
  const [acceptedChallenges, setAcceptedChallenges] = useState([]);
  const [displayFightButton, setDisplayFightButton] = useState(false);

  const [upcomingFightData, setUpcomingFightData] = useState({});

  useEffect(() => {
    console.log("Displaying accepted challenges state...");
    console.log(acceptedChallenges);
  }, [acceptedChallenges]);

  // SSE connection functions
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
          console.log("Accepted challenges recieved...");
          console.log(eventData.data);
          setAcceptedChallenges(eventData.data);
        }

        if (eventData.event === "sendBet") {
          console.log("Send bet button activated");
          alert(eventData.data.notification);
          console.log(eventData.data.fightData);
          // Later when CSS applied, display in the middle of the screen
          setFightData(eventData.data.fightData);
          setUpcomingFightData(eventData.data.fightData);
          setDisplayFightButton(true);
        }
      });

      setSse(sseInstance);
    } catch (error) {
      console.log(error);
    }
  };

  const closeConnection = () => {
    if (sse) {
      sse.close();
      setSse(null);
      setChallenges({});
      setAcceptedChallenges({});
      setDisplayFightButton(false);
    }
  };

  // Buy ticket function
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

  const getAllowedInputs = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const chainIdBig = await signer.provider.getNetwork();
    const chainId = Number(chainIdBig.chainId);
    const contractABI = await getContractAbi(chainId, "InputControlModular");
    const contractAddress = await getContractAddress(
      chainId,
      "InputControlModular"
    );
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    let tx = await contract.getAllowedInputs(
      "startFight(address[2],uint256[2],uint256[2])",
      signer.address
    );
    return tx;
  };

  // Start fight functions
  const sendBetAndStartFight = async () => {
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
    const betValue1 = await ethers.parseEther(
      await upcomingFightData.bet1.toString()
    );
    const betValue2 = await ethers.parseEther(
      await upcomingFightData.bet2.toString()
    );
    alert("The following payment is for sending the bet.");
    if (signer.address === upcomingFightData.p1) {
      let tx = await contract.setBet({ value: betValue1 });
      await tx.wait();
    } else {
      let tx = await contract.setBet({ value: betValue2 });
      await tx.wait();
    }

    setTimeout(async () => {
      console.log("Trying to call tx to start fight...");
      console.log(upcomingFightData.p1);
      console.log(upcomingFightData.p2);
      console.log(upcomingFightData.nft1);
      console.log(upcomingFightData.nft2);
      console.log(betValue1);
      console.log(betValue2);

      const types = [
        { type: "address[2]" },
        { type: "uint256[2]" },
        { type: "uint256[2]" },
      ];
      const inputs = [
        [upcomingFightData.p1, upcomingFightData.p2],
        [upcomingFightData.nft1, upcomingFightData.nft2],
        [betValue1, betValue2],
      ];
      const coder = new ethers.AbiCoder();
      const abiEncodedInput = await coder.encode(types, inputs);
      const validInput = await ethers.keccak256(abiEncodedInput);
      console.log("VALID INPUT IS");
      console.log(validInput);

      const inputss = await getAllowedInputs();
      console.log("Inputs recieved by control");
      console.log(inputss);

      try {
        const tx2 = await contract.startFight(
          [upcomingFightData.p1, upcomingFightData.p2],
          [upcomingFightData.nft1, upcomingFightData.nft2],
          [betValue1, betValue2]
        );
      } catch (error) {
        console.log(error);
      }
      // console.log(tx2);
      // console.log(
      // "All done don't worry about last tx not succeeding. GO FIGHT!"
      // );
    }, 5000); // 15000 milliseconds equals 15 seconds

    alert(`In 15 seconds you will be asked to start the fight. Don't worry if 
    the tx reverts, that means your opponent already started it. If you sent your bet you are fine.`);
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
      <button
        onClick={async () => {
          await payForTicket();
        }}
      >
        BUY FIGHT TICKET
      </button>
      {!sse && <h1> Fight radar not active </h1>}

      {sse && (
        <ChallengesSection
          challenges={challenges}
          acceptedChallenges={acceptedChallenges}
        />
      )}

      {displayFightButton && (
        <button
          onClick={async () => {
            await sendBetAndStartFight();
          }}
        >
          SEND BET!
        </button>
      )}

      {displayFightButton && (
        <button
          onClick={async () => {
            await setShowFightPage(true);
          }}
        >
          GO FIGHT!
        </button>
      )}
    </section>
  );
}
